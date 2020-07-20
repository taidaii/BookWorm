import React from "react";
import {Card, Modal, Form,Input, Button, message} from "antd";
import BaseForm from '../../../../common/BaseForm'
import Etable from "../../../../common/Etable";
import { updateSelectedItem } from '../../../../utils'
import request from '../../../../utils/request'
import axios from 'axios'
const FormItem = Form.Item


export default class Permission extends React.Component{

    params = {
        page:1,
        pageSize:5
    }
    data = [
        {
            type:'input',
            initialValue:'',
            label:'数据源',
            placeholder:'请输入数据源',
            field:'name',
            width:'150px'
        }
    ]

    state= {
        rowSelection:{
            selectedRowKeys:[],
            selectedRows:[],
        },
        type:'radio',
        list:[],
        roleVisible:false,
        perVisible:false,
        authVisible:false,
        checkedKeys:[],
        targetKeys:[],
        detail:{},
        title:''
    }

    //查询
    handleSearch = (data)=>{
        console.log(data)
        var _this = this
        let API_URL = 'http://localhost:8000'
        const url = `${API_URL}/api/admin/search/url/`;
        axios({
            method:'post',
            url: url,
            data: {url: data.name},
        })
        .then(function(response) {
            let res = response.data
            console.log(res)
            if(res.state === true){
                let sources = res.data.map((item, index) => {
                    item.key = index;
                    return item;
                });
                
                let dataSource = sources.map(function(item) {
                    return {
                        key: item.key,
                        id: item.id,
                        dataUrl: item.url
                    }
                });
                console.log(dataSource)
                _this.setState({
                    dataSource
                })
            }
        })
    }

    componentDidMount(){
        this.requestList()
    }

    //请求列表
    requestList(){
        var _this = this
        let API_URL = 'http://localhost:8000'
        const url = `${API_URL}/api/admin/getallsource/`;
        axios({
            method:'post',
            url: url,
            data: { },
        })
        .then(function(response) {
            let res = response.data
            console.log(res)
            if(res.code ===1){
                let sources = res.data.map((item, index) => {
                    item.key = index;
                    return item;
                });
                
                let dataSource = sources.map(function(item) {
                    return {
                        key: item.key,
                        id: item.id,
                        dataUrl: item.url
                    }
                });
                console.log(dataSource)
                _this.setState({
                    dataSource
                })
            }
        })
    }

    // 创建用户
    handleUser=()=>{
        this.setState({
            detail:{
                loginName:'',
                name:'',
                mobile:'',
                address:'',
                email:''
            },
            roleVisible:true,
            title:'添加数据源'
        })
    }
    //编辑用户
    userEdit=(item)=>{
        this.setState({
            detail:item,
            roleVisible:true,
            title:'编辑数据源'
        })
    }
    //删除数据源
    handleDelete = (item,e)=>{
        e.stopPropagation()//阻止冒泡
        Modal.confirm({
            title:'确认',
            content:'您确认要删除此条数据吗？',
            onOk:()=>{
                message.success('删除成功');
                console.log(item)
                var _this = this
                let API_URL = 'http://localhost:8000'
                const url = `${API_URL}/api/admin/delete/datasource/`;
                axios({
                    method:'post',
                    url: url,
                    data: {id: item.id},
                })
                .then(function(response) {
                    let res = response.data
                    console.log(res)
                    if(res.state === true){
                        _this.requestList()
                    }
                })
            }
        })
    }
    
    // 更新数据源及添加数据源
    creatRoleSubmit(e) {
        let id = this.state.detail.id
        let new_url =  this.roleForm.props.form.getFieldsValue().loginName
        var _this = this
        let API_URL = 'http://localhost:8000'
       
        if(this.state.title === '添加数据源') {
            const url = `${API_URL}/api/admin/add/datasource/`;
            axios({
                method:'post',
                url: url,
                data: {url: new_url, name: new_url},
            })
            .then(function(response) {
                let res = response.data
                console.log(res)
                if(res.state === true){
                    _this.requestList()
                }
            })
        }
        else if(this.state.title === '编辑数据源'){
            const url = `${API_URL}/api/admin/update/datasource/`;
            axios({
                method:'post',
                url: url,
                data: {id: id, url: new_url},
            })
            .then(function(response) {
                let res = response.data
                console.log(res)
                if(res.state === true){
                    _this.requestList()
                }
            })
        }
        this.setState({
            roleVisible:false
        })
    }



    render(){
        const columns = [
            {
                title: '数据源ID',
                dataIndex: 'id'
            }, 
            {
                title: '数据源',
                dataIndex: 'dataUrl'
            },

            {
                title:'操作',
                render:(item)=>{
                    return (
                        <div>
                            <Button size="small" type="primary" onClick={this.userEdit.bind(this,item)} style={{marginRight:'10px'}}>编辑</Button>
                            <Button size="small" type="primary" onClick={ (e)=>{this.handleDelete(item,e)} }>删除</Button>
                        </div>
                    )
                }
            }
        ];

        return (
            <div>
                <Card>
                    <BaseForm
                        data={this.data}
                        handleSearch = {this.handleSearch}
                    />
                </Card>
                <Card style={{margin:'10px 0'}}>
                    <Button type="primary" onClick={this.handleUser}>添加数据源</Button>
                </Card>
                <Card>
                    <Etable
                        that={this}
                        dataSource={this.state.dataSource}
                        columns={columns}
                        rowSelection={this.state.rowSelection}
                        updateSelectedItem={updateSelectedItem.bind(this)}
                        pagination={this.state.pagination}
                        type={this.state.type}
                    >    
                    </Etable>
                </Card>
                <Modal
                    title={this.state.title}
                    visible={this.state.roleVisible}
                    onOk={(item, e)=>this.creatRoleSubmit(item, e)}
                    onCancel={()=>{this.setState({
                        roleVisible:false
                    })}}
                >
                    <CreatUser
                        detail = {this.state.detail}
                        wrappedComponentRef={(inst) => this.roleForm = inst} 
                    />
                </Modal>
            </div>
        )
    }
}

//创建角色
class CreatUser extends React.Component{

    render(){
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {span: 5},
            wrapperCol: {span: 16}
        }
        const detail = this.props.detail
        return (
            <Form>
                <FormItem label="数据源名" {...formItemLayout}>
                    {
                        getFieldDecorator('loginName',{
                            initialValue:detail.dataUrl
                        })(
                            <Input  type="text" placeholder="数据源名" />
                        )
                    }
                </FormItem>

            </Form>
        )
    }
}
CreatUser = Form.create()(CreatUser)
