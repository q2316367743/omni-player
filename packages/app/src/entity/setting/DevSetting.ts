export interface DevSetting {
  // 是否启用调试
  debug: boolean;
}

export function buildDevSetting(): DevSetting {
  return {
    debug: false,
  };
}