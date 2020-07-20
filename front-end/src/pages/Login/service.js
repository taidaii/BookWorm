import request from '../../utils/request'
const API_URL = 'http://localhost:8000';
// 登陆
export function login( data) {
  console.log(data)
  return request({
    url: '/user/login',
    method: 'post',
    data,
  })
}
// 2.获取商户支持的支付方式
