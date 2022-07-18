import axios from "axios";
import { ElLoading ,ElMessage} from 'element-plus'

const LoadingInstance = {
    _target: null, //保存Loading实例
    _count: 0
}
const pendingMap = new Map();

/**
 * 生成每个请求唯一的键
 * @param {*} config
 * @returns string
 */
function getPendingKey(config) {
    let { url, method, params, data } = config;
    // 如果是string
    if (typeof data === "string") data = JSON.parse(data);
    return [url, method, JSON.stringify(params), JSON.stringify(data)].join("&");
}

/**
 * 储存每个请求唯一值, 也就是cancel()方法, 用于取消请求
 * @param {*} config
 */
function addPending(config) {
    const uniq_key = getPendingKey(config);
    config.cancelToken =
        config.cancelToken ||
        new axios.CancelToken((cancel) => {
            if (!pendingMap.has(uniq_key)) {
                pendingMap.set(uniq_key, cancel);
            }
        });
}
/**
 * 删除重复的请求
 * @param {*} config
 */

function removePending(config) {
    const uniq_key = getPendingKey(config);
    if (pendingMap.has(uniq_key)) {
        const cancelToken = pendingMap.get(uniq_key);
        cancelToken(uniq_key);
        pendingMap.delete(uniq_key);
    }
}

function Axios(params, customOptions, loadingOptions) {
    const service = axios.create({
        baseURL: "http://localhost:8000", //设置统一请求前缀
        timeout: 10000, // 设置统一超时时长
    });

    // 自定义配置
    let custom_options = Object.assign({
        repeat_request_cancel: false, // 是否开启取消重复请求, 默认为 true
        loading: true, // 是否开启loading层效果, 默认为false
        error_message_show: true, // 是否开启接口错误信息展示，默认为true
        reduct_data_format: true, // 是否开启简洁的数据结构响应, 默认为true
    }, customOptions);


    // 请求拦截
    service.interceptors.request.use(
        (config) => {
            removePending(config);
            custom_options.repeat_request_cancel && addPending(config);
            // 创建loading
            if (custom_options.loading) {
                LoadingInstance._count++
                if (LoadingInstance._count === 1) {
                    LoadingInstance._target = ElLoading.service(loadingOptions);
                }
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );
    
    // 响应拦截
    service.interceptors.response.use(
        (response) => {
            removePending(response.config);
            custom_options.loading && closeLoading(custom_options) //关闭loading
            return custom_options.reduct_data_format ? response.data : response;;
        },
        (error) => {
            error.config && removePending(error.config);
            custom_options.error_message_show && httpErrorStatusHandle(error) // 处理错误状态码
            return Promise.reject(error); // 错误继续返回给到具体页面
        }
    );

    return service(params);
}

const httpErrorStatusHandle = (error)=> {
// 处理被取消的请求
if(axios.isCancel(error)) return console.error('请求的重复请求：' + error.message);
let message = '';
if (error && error.response) {
    switch(error.response.status) {
      case 302: message = '接口重定向了！';break;
      case 400: message = '参数不正确！';break;
      case 401: message = '您未登录，或者登录已经超时，请先登录！';break;
      case 403: message = '您没有权限操作！'; break;
      case 404: message = `请求地址出错: ${error.response.config.url}`; break; // 在正确域名下
      case 408: message = '请求超时！'; break;
      case 409: message = '系统已存在相同数据！'; break;
      case 500: message = '服务器内部错误！'; break;
      case 501: message = '服务未实现！'; break;
      case 502: message = '网关错误！'; break;
      case 503: message = '服务不可用！'; break;
      case 504: message = '服务暂时无法访问，请稍后再试！'; break;
      case 505: message = 'HTTP版本不受支持！'; break;
      default: message = '异常问题，请联系管理员！'; break
    }
  }
  if (error.message.includes('timeout')) message = '网络请求超时！';
  if (error.message.includes('Network')) message = window.navigator.onLine ? '服务端异常！' : '您断网了！';
  ElMessage({
    type: 'error',
    message
  })
}
/**
 * 关闭Loading层实例
 * @param {*} _options 
 */
const closeLoading = (_options) => {
    if (_options.loading && LoadingInstance._count > 0) LoadingInstance._count--
    console.log(LoadingInstance)

    if (LoadingInstance._count === 0) {
        LoadingInstance._target.close()
        LoadingInstance._target = null
    }
}

export default Axios;
