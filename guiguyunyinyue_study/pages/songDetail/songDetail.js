// pages/songDetail/songDetail.js
import request from "../../utils/request";
import Pubsub from 'pubsub-js';

//获取全局实例

Page({

    /**
     * 页面的初始数据
     */
    data: {
        isPlay:false,//音乐是否播放
        song:{},
        musicId:'',
        musicLink:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let musicId=options.musicId
        this.setData({
            musicId
        })
        this.getMusicInfo(musicId)
        //创建控制音乐播放的实例
        this.backgroundAudioManager=wx.getBackgroundAudioManager()
        this.backgroundAudioManager.onPlay(()=>{
            this.setData({
                isPlay:true
            })
        })
        this.backgroundAudioManager.onPause(()=>{
            this.setData({
                isPlay:false
            })
        })
    },

    //获取音乐详情的功能函数
    async getMusicInfo(musicId){
        let songData=await request('/song/detail',{ids:musicId})
        this.setData({
            song:songData.songs[0]
        })

        //动态修改窗口标题
        wx.setNavigationBarTitle({
            title:this.data.song.name
        })
    },

    //点击播放/暂停的回调
    handleMusicPlay(){
        let isPlay=!this.data.isPlay
        //修改是否播放的状态
        // this.setData({
        //     isPlay
        // })
        let {musicId,musicLink}=this.data
        this.musicControl(isPlay,musicId,musicLink)
    },

    //点击播放/暂停的功能函数
    async musicControl(isPlay,musicId,musicLink){
        if(isPlay){
            if(!musicLink){
                //获取音乐播放链接
                let musicLinkData=await request('/song/url',{id:musicId})
                let musicLink=musicLinkData.data[0].url

                this.setData({
                    musicLink
                })
            }

            this.backgroundAudioManager.src=musicLink
            this.backgroundAudioManager.title=this.data.song.name
        }else{
            this.backgroundAudioManager.pause()
        }
    },

    //点击切歌的回调
    handleSwitch(event){
      //获取切歌的类型
      let type=event.currentTarget.id
        //关闭当前播放的音乐
        this.backgroundAudioManager.stop()
        //订阅来自recommendSong页面发布的musicId消息
        Pubsub.subscribe('musicId',(msg,musicId)=>{
            //获取音乐详情
            this.getMusicInfo(musicId)
            //自动播放当前的音乐
            this.musicControl(true,musicId)
            //取消订阅
            Pubsub.unsubscribe('musicId')
        })
      //发布消息数据给recommmendSong页面
      Pubsub.publish('switchType',type)

    },


    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})