export interface IFacebookUser {
  id: string,
  first_name?: string,
  last_name?: string,
  email?: string,
  picture?: {
    data?: {
        url?: string,
    },
  },
}