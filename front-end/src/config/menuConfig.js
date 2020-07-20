import OrderList from "../pages/User/OrderManage/OrderList";
import UserManage from "../pages/User/Permission/UserManage";

const menuList = [
    // {
    //     title: '首页',
    //     key: '/home'
    // },
    {
        path: '/user/order',
        pathName: 'order-manage',
        name: '书籍资源管理',
        icon: 'eye',
        children: [
            {
                path: '/user/order/list',
                pathName: 'order-list',
                name: '电子书籍列表',
                icon: 'table'
            },


        ]
    },

    {
        path: '/user/permission',
        pathName: 'permission',
        name: '数据源管理',
        icon: 'table',
        children: [
            {
                path: '/user/permission/user',
                pathName: 'user-manage',
                name: '数据源列表',
                icon: 'table'
            },

        ]
    }
];
export default menuList;