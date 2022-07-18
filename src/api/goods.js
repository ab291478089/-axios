import  Axios from "./axios";

export function getListApi(params) {
  return Axios({
    url: "/api/list",
    method: "get",
  });
}
