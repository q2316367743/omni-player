import type {Screenplay, SpDialogue, SpRole, SpScene} from "@/entity/screenplay";
import type {SpRoleAppearance} from "@/entity/screenplay/SpRoleAppearance";
import {askAiScreenplayDirector, type DirectorDecision} from "@/modules/ai/AiScreenplayDirector";
import {aiScreenplayRole} from "@/modules/ai/AiScreenplayRole";
import {askAiScreenplayNarrator} from "@/modules/ai/AiScreenplayNarrator";
import {
  addSpRoleAppearanceService,
  listSpRoleAppearanceService,
  retractSpRoleAppearanceService
} from "@/services/screenplay/SpRoleAppearanceService";

export interface AutoPlayConfig {
  screenplay: Screenplay;
  currentScene: SpScene;
  scenes: SpScene[];
  roles: SpRole[];
  roleMap: Map<string, SpRole>;
  director: SpRole;
  narrator: SpRole;
  maxSceneTurns?: number;
  onLoadingPush?: (loadingRoleIds: string[]) => void;
  onLoadingPop?: (loadingRoleIds: string[]) => void;
  onDialogueUpdate?: () => void;
  onSceneChange?: (sceneId: string) => void;
  onPause?: () => void;
  getDialogues: () => Promise<SpDialogue[]>;
  onRoleAppearanceUpdate?: () => void;
}

export interface AutoPlayState {
  isRunning: boolean;
  dialogueLength: number;
  continuousDialogueCount: number;
  lastNarrationDistance: number;
  dialogues: SpDialogue[];
}

export class AutoPlayManager {
  private config: AutoPlayConfig;
  private state: AutoPlayState;
  private abortController: AbortController | null = null;
  private delayTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: AutoPlayConfig) {
    this.config = config;
    this.state = {
      isRunning: false,
      dialogueLength: 0,
      continuousDialogueCount: 0,
      lastNarrationDistance: 0,
      dialogues: []
    };
  }

  async start() {
    if (this.state.isRunning) return;

    this.abortController = new AbortController();
    this.state.isRunning = true;

    await this.fetchDialogues();
    await this.runTurn();
  }

  pause() {
    this.state.isRunning = false;
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    if (this.delayTimer) {
      clearTimeout(this.delayTimer);
      this.delayTimer = null;
    }
    this.config.onPause?.();
  }

  async resume() {
    if (this.state.isRunning) return;
    await this.start();
  }

  private async runTurn() {
    if (!this.state.isRunning) return;

    try {
      await this.fetchDialogues();

      console.log('=== Auto Play Turn ===');
      console.log('Dialogue length:', this.state.dialogueLength);
      console.log('Continuous dialogue count:', this.state.continuousDialogueCount);
      console.log('Last narration distance:', this.state.lastNarrationDistance);

      const decision = await this.askDirector();

      console.log('Director decision:', decision);

      if (decision.request_director_intervention) {
        console.log('Director intervention requested:', decision.request_director_intervention);
        this.pause();
        return;
      }

      if (decision.suggest_scene_change) {
        await this.changeScene();
        return;
      }

      if (decision.role_exit) {
        console.log('Processing role exit for:', decision.role_exit.role_id);
        await this.processRoleExit(decision.role_exit.role_id);
      }

      if (decision.role_enter) {
        console.log('Processing role enter for:', decision.role_enter.role_id, 'type:', decision.role_enter.entry_type);
        await this.processRoleEnter(decision.role_enter.role_id, decision.role_enter.entry_type);
        if (decision.next_speaker) {
          console.log('Processing role turn for:', decision.next_speaker);
          await this.processRoleTurn(decision.next_speaker);
          this.state.continuousDialogueCount++;
          this.state.lastNarrationDistance++;
        } else {
          console.log('No speaker selected after role enter, skipping role turn');
          this.state.continuousDialogueCount = 0;
        }
      } else {
        if (decision.insert_narration) {
          console.log('Inserting narration...');
          await this.insertNarration();
          this.state.continuousDialogueCount = 0;
          this.state.lastNarrationDistance = 0;
        }

        if (decision.next_speaker) {
          console.log('Processing role turn for:', decision.next_speaker);
          await this.processRoleTurn(decision.next_speaker);
          this.state.continuousDialogueCount++;
          this.state.lastNarrationDistance++;
        } else {
          console.log('No speaker selected, skipping role turn');
          this.state.continuousDialogueCount = 0;
        }
      }

      this.state.dialogueLength++;

      await this.delay(1000);

      if (this.state.isRunning) {
        await this.runTurn();
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Auto play aborted');
      } else {
        console.error('Error in auto play:', error);
        this.pause();
      }
    }
  }


  private async askDirector(): Promise<DirectorDecision> {
    const roleAppearances = await this.getRoleAppearances(this.config.currentScene.id);
    const currentSceneRoles = roleAppearances
      .map((ra: SpRoleAppearance) => this.config.roleMap.get(ra.role_id)!)
      .filter(Boolean);
    
    console.log('[Director] Current scene roles:', currentSceneRoles.map((r: SpRole) => `${r.name} (${r.id})`));
    console.log('[Director] Scene ID:', this.config.currentScene.id);

    if (currentSceneRoles.length === 0) {
      console.warn('[Director] No roles found in current scene. Please check role_appearance configuration.');
    }

    this.config.onLoadingPush?.([this.config.director.id]);

    try {
      return await askAiScreenplayDirector({
        director: this.config.director,
        screenplay: this.config.screenplay,
        scene: this.config.currentScene,
        roles: currentSceneRoles,
        dialogueLength: this.state.dialogueLength,
        dialogues: this.state.dialogues.slice(-10),
        roleMap: this.config.roleMap,
        continuousDialogueCount: this.state.continuousDialogueCount,
        lastNarrationDistance: this.state.lastNarrationDistance,
        maxSceneTurns: this.config.maxSceneTurns || 20
      });
    }finally {
      this.config.onLoadingPop?.([this.config.director.id]);
    }
  }

  private async getRoleAppearances(sceneId: string) {
    return listSpRoleAppearanceService(this.config.screenplay.id, sceneId);
  }

  private async processRoleTurn(roleId: string) {
    const role = this.config.roleMap.get(roleId);
    if (!role) return;

    const roleAppearances = await this.getRoleAppearances(this.config.currentScene.id);
    const currentSceneRoles = roleAppearances
      .map((ra: SpRoleAppearance) => this.config.roleMap.get(ra.role_id)!)
      .filter(Boolean);

    this.config.onLoadingPush?.([roleId]);

    try {
      await aiScreenplayRole({
        role: role,
        narrator: this.config.narrator,
        screenplay: this.config.screenplay,
        scene: this.config.currentScene,
        dialogues: this.state.dialogues.slice(-10),
        roleMap: this.config.roleMap,
        roles: currentSceneRoles
      });
    } finally {
      this.config.onLoadingPop?.([roleId]);
    }

    this.config.onDialogueUpdate?.();
  }

  private async insertNarration() {
    const roleAppearances = await this.getRoleAppearances(this.config.currentScene.id);
    const currentSceneRoles = roleAppearances
      .map((ra: SpRoleAppearance) => this.config.roleMap.get(ra.role_id)!)
      .filter(Boolean);

    this.config.onLoadingPush?.([this.config.narrator.id]);

    try {
      await askAiScreenplayNarrator({
        narrator: this.config.narrator,
        screenplay: this.config.screenplay,
        scene: this.config.currentScene,
        roles: currentSceneRoles,
        dialogues: this.state.dialogues.slice(-10),
        roleMap: this.config.roleMap,
        task: 'insert_atmosphere',
        triggerReason: '导演要求插入氛围描写'
      });
    } finally {
      this.config.onLoadingPop?.([this.config.narrator.id]);
    }

    this.config.onDialogueUpdate?.();
  }

  private async changeScene() {
    const roleAppearances = await this.getRoleAppearances(this.config.currentScene.id);
    const currentSceneRoles = roleAppearances
      .map((ra: SpRoleAppearance) => this.config.roleMap.get(ra.role_id)!)
      .filter(Boolean);

    await askAiScreenplayNarrator({
      narrator: this.config.narrator,
      screenplay: this.config.screenplay,
      scene: this.config.currentScene,
      roles: currentSceneRoles,
      dialogues: this.state.dialogues.slice(-10),
      roleMap: this.config.roleMap,
      task: 'describe_scene',
      triggerReason: '场景切换'
    });

    this.config.onDialogueUpdate?.();

    const currentSceneIndex = this.config.scenes.findIndex(s => s.id === this.config.currentScene.id);
    const nextScene = this.config.scenes[currentSceneIndex + 1];

    if (nextScene) {
      this.config.onSceneChange?.(nextScene.id);
    } else {
      this.pause();
    }
  }

  private async processRoleEnter(roleId: string, entryType: 'normal' | 'quiet' | 'dramatic' | 'sudden') {
    const role = this.config.roleMap.get(roleId);
    if (!role) {
      console.error(`Role not found: ${roleId}`);
      return;
    }

    await addSpRoleAppearanceService({
      screenplay_id: this.config.screenplay.id,
      role_id: roleId,
      scene_id: this.config.currentScene.id,
      is_active: 1
    });

    const entryTypeMap = {
      'normal': '正常入场',
      'quiet': '悄悄入场',
      'dramatic': '戏剧性入场',
      'sudden': '突发入场'
    };

    await askAiScreenplayNarrator({
      narrator: this.config.narrator,
      screenplay: this.config.screenplay,
      scene: this.config.currentScene,
      roles: [role],
      dialogues: this.state.dialogues.slice(-10),
      roleMap: this.config.roleMap,
      task: 'describe_role_entry',
      triggerReason: `${role.name}${entryTypeMap[entryType]}`
    });

    await this.fetchDialogues();

    this.config.onRoleAppearanceUpdate?.();
    this.config.onDialogueUpdate?.();
  }

  private async processRoleExit(roleId: string) {
    const roleAppearances = await this.getRoleAppearances(this.config.currentScene.id);
    const appearance = roleAppearances.find(ra => ra.role_id === roleId && ra.is_active === 1);
    
    if (!appearance) {
      console.error(`Active role appearance not found: ${roleId}`);
      return;
    }

    await retractSpRoleAppearanceService(appearance.id, this.config.screenplay.id, this.config.currentScene.id);
    this.config.onRoleAppearanceUpdate?.();
    this.config.onDialogueUpdate?.();
  }


  private async fetchDialogues() {
    this.state.dialogues = await this.config.getDialogues();
  }

  private async delay(ms: number) {
    return new Promise(resolve => {
      this.delayTimer = setTimeout(resolve, ms);
    });
  }

  async updateScene(scene: SpScene) {
    this.config.currentScene = scene;
    this.state.dialogueLength = 0;
    this.state.continuousDialogueCount = 0;
    this.state.lastNarrationDistance = 0;
    await this.fetchDialogues();
  }

  isRunning(): boolean {
    return this.state.isRunning;
  }
}
