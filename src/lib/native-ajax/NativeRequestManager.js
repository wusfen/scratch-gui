// import bridge from '../../playground/bridge';
// import BridgeAction from './bridge_action';


// class NativeRequestManager{
//   _instance

//   /** @type {Map<number,RequestTrans>} */
//   reqTransMap = new Map()

//   static getInstance (){
//       if (!this._instance) this._instance = new NativeRequestManager();
//       return this._instance;
//   }

//   /**
//    * 添加一个请求事务
//    * @param {any} options 请求参数参数
//    * @returns {Promise<any>} 返回一个事务promise
//    */
//   addRequestTrans (options){
//       const trans = new RequestTrans();
//       this.reqTransMap.set(httpid++, trans);
//       return trans.promise(options);
//   }

//   /**
//    * 添加一个请求事务
//    * @param {number} id 请求参数参数
//    */
//   removeRequestTrans (id){
//       this.reqTransMap.delete(id);
//   }
// }


// export default NativeRequestManager.getInstance();
