const createStore = (reducer) => {
  let state = undefined;
  const listeners = [];
  return {
    dispatch(action) {
      state = reducer(state, action);
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.push(listener);
    },

    getState() {
      return state;
    },
  };
};

const initState = {
  createBox: false,
  imageRect: { x: 0, y: 0, width: 0, height: 0 },
  offset: { left: 0, top: 0 },
  scale: 1,
  apiCount: 0,
  mode: "none",
  lines: [],
  isUpload: false,
};

export const actiontype = {
  SCALE: "SCALE",
  CREATBOX: "CREATBOX",
  BORDER: "BORDER",
  INITSTATE: "INITSTATE",
  OFFSET: "OFFSET",
  APICALLCOUNT: "APICALLCOUNT",
  MODE: "MODE",
  ADDLINE: "ADDLINE",
  REMOVELINE: "REMOVELINE",
  LINEPOSITION: "LINEPOSITION",
  UPLOAD: "UPLOAD",
};

const reducer = (state = initState, action) => {
  if (action.type === actiontype.SCALE) {
    return { ...state, scale: action.payload };
  } else if (action.type === actiontype.CREATBOX) {
    return { ...state, createBox: action.payload };
  } else if (action.type === actiontype.OFFSET) {
    return { ...state, offset: action.payload };
  } else if (action.type === actiontype.APICALLCOUNT) {
    return { ...state, apiCount: action.payload };
  } else if (action.type === actiontype.MODE) {
    return { ...state, mode: action.payload };
  } else if (action.type === actiontype.BORDER) {
    return { ...state, imageRect: action.payload };
  } else if (action.type === actiontype.INITSTATE) {
    return initState;
  } else if (action.type === actiontype.ADDLINE) {
    let newLine = action.payload;
    const stx = state.lines.map((line) => line[3]);
    newLine = newLine.filter((line) => !stx.includes(line[3]));
    const lines = [...state.lines, ...newLine];
    return { ...state, lines };
  } else if (action.type === actiontype.LINEPOSITION) {
    const lines = action.payload;
    return { ...state, lines };
  } else if (action.type === actiontype.REMOVELINE) {
    state.lines.pop();
    const lines = [...state.lines];
    return { ...state, lines };
  } else if (action.type === actiontype.UPLOAD) {
    return { ...state, isUpload: action.payload };
  }
};

export const store = createStore(reducer);
