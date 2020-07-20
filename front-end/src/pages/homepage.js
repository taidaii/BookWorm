import React from 'react';
import '../asset/navigation.css';
import logo from '../asset/picture/logo.png';
import {Layout, Menu, Avatar, Dropdown, Input,Button} from 'antd';
import axios from 'axios';
import cookie from 'react-cookies';
import {Link} from 'react-router-dom';
import back from '../asset/picture/back.jpg';


const {Header,Content} = Layout;

var sty = {
backgroundSize: '110%,100%',
    height:"100%",
    width:"100%",
    position: "absolute",
    top: "0px",
  backgroundImage: `url(${back})` 
};


class homepage extends React.Component {
    constructor(props){
          super(props);
          this.state = {
            search:'',
         }
          this.handleChange=this.handleChange.bind(this);
          this.submit=this.submit.bind(this);
    }
    //更新输入框数据
    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }
    async submit(){
        //跳转至搜索网页,在url中添加信息
        this.context.history.push()
        //window.location.href="http://localhost:3000/search?search="+this.state.search;
     }
    render() {
        if ((cookie.load('token')==undefined||cookie.load('token')==null))
            this.loginButton = 
            <Link to="/login">
	     <Button className="e-button" type="primary"> 管理员登陆 </Button>
             </Link>
        
        return (
            <div style={sty}>
            <Header>
                <Menu size="small" theme="dark" mode="horizontal">
                    {this.loginButton}
                </Menu>
                <Content style={{padding: '0 50px'}}>
                    {this.content}
            </Content>
            </Header>
            <div className="logo-container"  align="center">
                 <img  height="400" width="400" className="logo-img"  src={logo} />
            </div>
            <div align="center">

                <Input style={{width:"30%"}}  name="search" onChange={this.handleChange}/>
                <Link to={"/search?search="+this.state.search}><Button type="primary" htmlType="submit" >搜索</Button></Link>
            </div>
            </div>
        );
    }
}
export default homepage;