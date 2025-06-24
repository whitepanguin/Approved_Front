import { createAction, handleActions } from "redux-actions";

const SET_PREVIOUS_URL = "user/SET_PREVIOUS_URL";
const SET_USER = "user/SET_USER";
const SET_USER_STATUS = "user/USER_STATUS";

// 액션 생성자
export const setPreviousUrl = createAction(
  SET_PREVIOUS_URL,
  (previousUrl) => previousUrl
);

// ✅ user 전체가 아닌 user.user를 저장
// null일 수 있으니 안전하게 null 처리
export const setUser = createAction(
  SET_USER,
  (response) => response?.user ?? null
);

export const setUserStatus = createAction(
  SET_USER_STATUS,
  (isLogin) => isLogin
);

// 초기값
const UserInitalValue = {
  currentUser: {},
  isLogin: false,
  previousUrl: "",
};

// 리듀서
const user = handleActions(
  {
    [SET_PREVIOUS_URL]: (state, action) => ({
      ...state,
      previousUrl: action.payload,
    }),
    [SET_USER]: (state = UserInitalValue, action) => ({
      ...state,
      currentUser: action.payload,
    }),
    [SET_USER_STATUS]: (state = UserInitalValue, action) => ({
      ...state,
      isLogin: action.payload,
    }),
  },
  UserInitalValue
);

export default user;
