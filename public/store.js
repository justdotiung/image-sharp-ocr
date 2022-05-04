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
  divistionCount: 1,
  imageRect: { x: 0, y: 0, width: 0, height: 0 },
  scale: 1,
};

export const actiontype = {
  INCREASE: "INCREASE",
  DECREASE: "DECREASE",
  SCALE: "SCALE",
  BORDER: "BORDER",
};

const reducer = (state = initState, action) => {
  if (action.type === actiontype.INCREASE) {
    return { ...state, divistionCount: state.divistionCount + 1 };
  } else if (action.type === actiontype.DECREASE) {
    return { ...state, divistionCount: state.divistionCount - 1 };
  } else if (action.type === actiontype.SCALE) {
    return { ...state, scale: action.payload };
  } else if (action.type === actiontype.BORDER) {
    return { ...state, imageRect: action.payload };
  }
};

export const store = createStore(reducer);
