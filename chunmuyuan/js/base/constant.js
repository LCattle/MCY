define([],function(){
	var constant = {
		/**
		 * 自选菜订单
		 */
		
		//自选菜
		ORDER_TYPE_OPTION : 1,
		/**
		 * 宅配套餐订单
		 */
		ORDER_TYPE_PACKAGE : 2,
		/**
		 * 实体卡订单
		 */
		ORDER_TYPE_ENTITY_CARD  : 3,
		/**
		 * 电子卡订单
		 */
		ORDER_TYPE_ELECTRONIC_CARD  : 4,
		/**
		 * 充值卡订单
		 */
		ORDER_TYPE_RECHARGE_CARD  : 5,
		/**
		 * 地推订单
		 */
		ORDER_TYPE_OFFLINE_CARD  : 6,
		/**
		 * 补货单
		 */
		ORDER_TYPE_REPLENISHMENT  : 7,
		/**
		 * 种植机
		*/
		ORDER_PLANTER_MACHINE : 10
	}
	return constant;
});