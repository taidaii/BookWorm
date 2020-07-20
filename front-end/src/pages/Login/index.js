import { Form, Icon, Input, Button, message } from 'antd'
import React from 'react'
import { Redirect } from 'react-router-dom'
import connect from '../../utils/connect'
import { login } from './service'
import axios from 'axios'
import './index.less'
@connect

class NormalLoginForm extends React.Component {
    
    handleSubmit = e => {
        const _this = this
        e.preventDefault();
        let email = this.props.form.getFieldsValue().email
        let password = this.props.form.getFieldsValue().password
        let data = {
            "email": email,
            "password": password
        }

        let API_URL = 'http://localhost:8000'
        const url = `${API_URL}/api/users/login/`;
        axios({
            method:'post',
            url: url,
            data: {
                ...data
            },
        })
        .then(function(response) {
            if (response.data['state'] === false) {
                message.error(response.data['message'])
                return
            }
            _this.props.form.validateFields((err, values) => {
                if (!err) {
                    _this.authChange(values)
                }else{
                    console.log(err)
                }
            })
        })
        .catch(function(error) {
            console.log(error);
        }) 
    }

    authChange =  (values)=>{
        const { dispatch, authChangeAction } = this.props
        login(values).then(res =>{
            const action =  authChangeAction(res.data.token)
            dispatch(action)
        })
    }

    render() {
        if(this.props.state.authed ||localStorage.getItem('authed')){
            return (
                <Redirect to="/user" />
            )
        }
        const { getFieldDecorator } = this.props.form;
        return (
            <div className="flex_center wrapper_login">
                <Form onSubmit={this.handleSubmit} className="login-form login-form-login">
                    <div className="login-title">书虫后台管理系统</div>
                    <Form.Item>
                        {getFieldDecorator('username', {
                            rules: [{ required: true, message: 'Please input your username!' }],
                        })(
                            <Input
                                prefix={<Icon type="user" />}
                                placeholder="username"
            
                            />,
                        )}
                    </Form.Item>
                    <Form.Item>
                        {getFieldDecorator('password', {
                            rules: [{ required: true, message: 'Please input your Password!' }],
                        })(
                            <Input
                                prefix={<Icon type="lock" />}
                                type="password"
                                placeholder="password"
                              
                            />,
                        )}
                    </Form.Item>
                    <Form.Item>
                        {getFieldDecorator('email', {
                            rules: [{ required: true, message: 'Please input your email!' }],
                        })(
                            <Input
                                prefix={<Icon type="lock" />}
                                type="email"
                                placeholder="email"
                                a
                            />,
                        )}
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="login-form-button">
                            Log in
                        </Button>
                    </Form.Item>
                    <Form.Item>
                        <div className="loginTip">用户为admin</div>
                    </Form.Item>
                </Form>
            </div>
        );
    }
}

const WrappedNormalLoginForm = Form.create({ name: 'normal_login' })(NormalLoginForm)
export default WrappedNormalLoginForm
