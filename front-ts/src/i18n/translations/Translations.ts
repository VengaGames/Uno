export type ErrorFunction = (...args: string[]) => string;

export type Translations = {
  app: {
    name: string,
  },
  // actions
  action: {
    back: string,
    cancel: string,
    save: string,
    delete: string,
    close: string,
    search: string,
    add: string,
    authenticate: string,
    disconnect: string,
    display_more: string,
    keep_editing: string,
    close_without_saving: string,
  },
  // common labels
  label: {
    more_options: string,
    confirm_delete: string,
    creation_date: string,
    loading: string,
    empty: string,
  },
  // common messages
  message: {
    changes_saved: string,
    unsaved_data: string,
  },
  // navigation
  nav: {
    home: string,
    users: string,
    user_list: string,
  },
  // home
  home: {
    title: string,
  },
  login: {
    title: string,
  },
  // errors
  error: {
    field: {
      required: string,
      email_wrong_format: string,
      password_same_value: string,
      empty_field: string,
    },
  },
  'http-errors': {
    INTERNAL_ERROR: string,
    NETWORK_ERROR: string,
    TIMEOUT_ERROR: string,
    FORBIDDEN_ERROR: string,
    WRONG_LOGIN_OR_PASSWORD: string,
    TOO_MANY_WRONG_ATTEMPS: (seconds: string) => string,
    FIELD_REQUIRED: (fieldName: string) => string,
    MESSAGE: (message: string) => string,
  },
};
