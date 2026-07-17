(() => {
  const STORE = "sound-warriors-reading-v1";
  const state = load();
  let activeText = null;
  let timer = null;
  let remaining = 60;

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORE)) || {
        profiles: [
          { id: "simone", name: "Simone" },
          { id: "rui", name: "Rui" }
        ],
        activeProfileId: "simone",
        attempts: []
      };
    } catch {
      return { profiles: [{ id: "simone", name: "Simone" }], activeProfileId: "simone", attempts: [] };
    }
  }

  function save() {
   