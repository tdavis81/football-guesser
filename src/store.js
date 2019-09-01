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
    
    // Current Week of Season EX : 1
    currentWeekNumber: {
      strict: true,
      namespaced: true,
      state: {
        Week: 0
      },
      mutations: {
        set(state, Week) {
          state.Week = Week;
        }
      }
    },
    
    // Current Season EX : 2019
    currentSeason: {
      strict: true,
      namespaced: true,
      state: {
        Season: 0
      },
      mutations: {
        set(state, Season) {
          state.Season = Season;
        }
      }
    },

    // Current Game Object
    currentGameObject: {
      strict: true,
      namespaced: true,
      state: {
        Game: []
      },
      mutations: {
        set(state, Game) {
          state.Game = Game;
        }
      }
    },

    // Current Game Opponents
    currentGameOpponents: {
      strict: true,
      namespaced: true,
      state: {
        Opponents: []
      },
      mutations: {
        set(state, Opponents) {
          state.Opponents = Opponents;
        }
      }
    },
    
    // Current Session User
    sessionUser: {
      strict: true,
      namespaced: true,
      state: {
        User: {}
      },
      mutations: {
        set(state, User) {
          state.User = User;
        }
      }
    },
    
    psuSchedule: {
      strict: true,
      namespaced: true,
      state: {
        Schedule: []
      },
      mutations: {
        set(state, Schedule) {
          state.Schedule = Schedule;
        }
      }
    },
    
    /*
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

    */
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
