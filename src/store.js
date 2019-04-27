export default {
  modules: {
    navigator: {
      strict: true,
      namespaced: true,
      state: {
        stack: [],
        options: {}
      },
      mutations: {
        push(state, page) {
          state.stack.push(page);
        },
        pop(state) {
          if (state.stack.length > 1) {
            state.stack.pop();
          }
        },
        replace(state, page) {
          state.stack.pop();
          state.stack.push(page);
        },
        reset(state, page) {
          state.stack = [page || state.stack[0]];
        },
        options(state, newOptions = {}) {
          state.options = newOptions;
        }
      }
    },

    splitter: {
      strict: true,
      namespaced: true,
      state: {
        open: false
      },
      mutations: {
        toggle(state, shouldOpen) {
          if (typeof shouldOpen === 'boolean') {
            state.open = shouldOpen;
          } else {
            state.open = !state.open;
          }
        }
      }
    },
    
    psuCurrentWeek: {
      strict: true,
      namespaced: true,
      state: {
        currentGameWeek: ''
      },
      mutations: {
        set(state, currentGameWeek) {
          state.currentGameWeek = currentGameWeek;
        }
      }
    },

    psuSchedule: {
      strict: true,
      namespaced: true,
      state: {
        schedule: []
      },
      mutations: {
        set(state, schedule) {
          state.schedule = schedule;
        }
      }
    },

    tabbar: {
      strict: true,
      namespaced: true,
      state: {
        index: 2
      },
      mutations: {
        set(state, index) {
          state.index = index;
        }
      }
    }
  }
};
