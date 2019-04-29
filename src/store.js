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

    sessionUser: {
      strict: true,
      namespaced: true,
      state: {
        user: ''
      },
      mutations: {
        set(state, user) {
          state.user = user;
        }
      }
    },

    liveScores: {
      strict: true,
      namespaced: true,
      state: {
        scoreObj: {}
      },
      mutations: {
        set(state, scoreObj) {
          state.scoreObj = scoreObj;
        }
      }
    },

    currentYear: {
      strict: true,
      namespaced: true,
      state: {
        currentYear: ''
      },
      mutations: {
        set(state, currentYear) {
          state.currentYear = currentYear;
        }
      }
    },

    currentWeekNumber: {
      strict: true,
      namespaced: true,
      state: {
        weekNumber: []
      },
      mutations: {
        set(state, weekNumber) {
          state.weekNumber = weekNumber;
        }
      }
    },

    currentGameObject: {
      strict: true,
      namespaced: true,
      state: {
        gameObject: []
      },
      mutations: {
        set(state, gameObject) {
          state.gameObject = gameObject;
        }
      }
    },

    tabbar: {
      strict: true,
      namespaced: true,
      state: {
        index: 0
      },
      mutations: {
        set(state, index) {
          state.index = index;
        }
      }
    }
  }
};
