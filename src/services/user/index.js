import {
  setUserSession,
  endUserSession
} from './actions';

import {
  loginFailed, 
  registerFailed, 
  accountExists
} from '../error/actions';

import {
  setAuthState, 
  clearAuthState
} from '../auth/actions';

import cookie from 'react-cookies';

export const login = (data = null) => async (dispatch, getState, api) => { 
  let authToken = data.authToken;
  if(!authToken) {
    let response = await api.post('/login', { email: data.email, password: data.password });
    if(response.data.token) {
      if(data.rememberMe === true) {
        cookie.save('rememberEmail', data.email);
      } else {
        cookie.remove('rememberEmail') 
      }
      authToken = response.data.token;
      cookie.save('authToken', authToken);
      dispatch(setAuthState(response.data))
    } else {
      return dispatch(loginFailed());
    }
  }

  let response = await api.post('/getUser', {token: authToken});
  if(response.data) {
    dispatch(setUserSession(response.data));
  } else {
    return dispatch(loginFailed());
  }
};

export const register = (data) => async (dispatch, getState, api) => {
  let response = await api.post('/register', data);
  if(response.data.token) {
    const authToken = response.data.token;
    cookie.save('authToken', authToken);
    response = await api.post('/getUser', {token: authToken});
    if(response.data) {
      dispatch(setUserSession(response.data));
    } else {
      dispatch(registerFailed());
    }
  } else {
    if(response.data.code === 1) {
      dispatch(accountExists());
    } else {
      dispatch(registerFailed());
    }
  }
}

export const logout = () => async (dispatch) => {
  cookie.remove('authToken');
  dispatch(endUserSession());
  dispatch(clearAuthState());
};