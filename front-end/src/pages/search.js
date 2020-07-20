import React from 'react';
import '../asset/navigation.css';
import {Layout, Menu, Avatar, Dropdown, Input,Button,List} from 'antd';

import cookie from 'react-cookies';
import {Link} from 'react-router-dom';

import searchService from './searchService';
import back from '../asset/picture/back.jpg';

const SearchService = new searchService();
const API_URL = 'http://localhost:8000';
const {Header,Content} = Layout;


var sty = {
	backgroundSize: '110%,100%',
	height:"100%",
	width:"100%",
	position: "absolute",
	top: "0px",
  backgroundImage: `url(${back})` 

};

class search extends React.Component {
    constructor(props){
          super(props);
          this.state = {
            allData:'',
            result:'',
            state:false,
         };
         this.handleChange=this.handleChange.bind(this);
         this.submit=this.submit.bind(this);
         this.changeType=this.changeType.bind(this);
    }
    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }
    async submit(){
        //跳转至搜索网页,在url中添加信息
        window.location.hash="/search?search="+this.state.search;
        let formData = new FormData();
        let url = document.URL;
        let searchUrl = url.split("=")[1];
        let searchValue=decodeURI(searchUrl);
        formData.append("search",searchValue);
        //调用后端api,并存储返回值，以下为参考调用语句
        console.log("the query is ");
        console.log(searchValue);
        //var json =  axios.post(SearchAPI,searchValue).then(response => response.data); 
        var responce = SearchService.getSearch({searchValue : searchValue}).then((result)=>{
            this.setState({
                allData: result['result'],
                result: result['result'],
                state: result['state'],
            });
          });
     }
    componentDidMount(){
        //传输数据的方式:使用formData
        let formData = new FormData();
        let url = document.URL;
        let searchUrl = url.split("=")[1];
        let searchValue=decodeURI(searchUrl);
        formData.append("search",searchValue);
        //调用后端api,并存储返回值，以下为参考调用语句
        console.log("the query is ");
        console.log(searchValue);
        //var json =  axios.post(SearchAPI,searchValue).then(response => response.data); 
        var responce = SearchService.getSearch({searchValue : searchValue}).then((result)=>{
            this.setState({
                allData: result['result'],
                result: result['result'],
                state: result['state'],
            });
          });
     }
     changeType(type){
        let allData=this.state.allData;
        let resultData = new Array();
        for(var i=0;i<allData.length;i++){
            if(allData[i].type===type){
                resultData.push(allData[i]);
            }
        }
        this.setState({result: resultData});
     }
    render() {
        return (
            <div style={sty}>
                <div align="center" style={{padding: '50px 0px 0px 0px'}}>
                
                    <Input style={{width:"30%"}}  name="search" onChange={this.handleChange}/>
                    <Button type="primary" htmlType="submit"  onClick={this.submit}>提交</Button>
                </div>
                <div align="center" style={{padding: '10px 0px 10px 0px'}}>
                    <Button style={{marginRight:"30px", marginLeft:"30px"}} type="primary" htmlType="submit"  onClick={this.changeType.bind(this,'doc')}>doc</Button>
                    <Button style={{marginRight:"30px", marginLeft:"30px"}}type="primary" htmlType="submit"  onClick={this.changeType.bind(this,'pdf')}>pdf</Button>
                    <Button style={{marginRight:"30px", marginLeft:"30px"}}type="primary" htmlType="submit"  onClick={this.changeType.bind(this,'rar')}>rar</Button>
                    <Button style={{marginRight:"30px", marginLeft:"30px"}}type="primary" htmlType="submit"  onClick={this.changeType.bind(this,'other')}>other</Button>
                </div>
                <div>
                    <List
                            style={{marginRight:"30px", marginLeft:"30px"}}
                            pagination={{
                                onChange: page => {
                                    console.log(page);
                                },
                                pageSize: 5,
                            }}
                            itemLayout="horizontal"
                            dataSource={this.state.result}
                            renderItem={item => (
                                <List.Item >
                                    <List.Item.Meta
                                        title={[<div><a href={item.link} target="_blank">{item.title}</a></div>]}
                                        description={<div>{item.des}</div>}
                                    />
                                </List.Item>
                            )}
                        />
                </div>
            </div>
        );
    }
}
export default search;