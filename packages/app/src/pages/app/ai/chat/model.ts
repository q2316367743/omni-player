
export const activeKey = ref('/home/welcome');
export const collapsed = ref(false);


export const toggleCollapsed = useToggle(collapsed);
export const autoHideCollapsed = () => {
  if (window.innerWidth < 960) {
    collapsed.value = true;
  }
}

export const model = useLocalStorage<string>("LocalName", () => {
  return "";
});


export const renderModel = (key: string) => {
  const split = key.split('/');
  return {
    aiServiceId: split[0],
    model: split.slice(1).join("/")
  };
}

export const renderGroup = (key: string) => {
  const s = Array.from(key.matchAll(/\d+/g));
  return s[0]![0];

}