import Axios from "./axios";
export function login(params) {
    return Axios({
        url: '/api/login',
        method: 'post',
        data: params

    })
}