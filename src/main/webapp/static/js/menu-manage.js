
$(function(){
	$('#tt').tree({
		method : 'POST',
		url : getRootPath() + 'admin/menu/MagageMenuList',
		animate:true,
		loadFilter: function(data){
			if (data.code == 200){
				return data.data;
			}else{
				HandleException(data);
			}
		},
		error : function(e) {
			$.messager.alert("提示消息", e.message,"error");
		},
		onClick: function(node){
			if(node.id == -1){
				loadMenu(0,"[主菜单]—子菜单模块");
			}else{
				loadMenu(node.id,"["+node.text+"]—子菜单模块");
			}
		}
	});
	loadMenu(0,"[主菜单]—子菜单模块");
	
	var datagrid; //定义全局变量datagrid
	var editRow = undefined; //定义全局变量：当前编辑的行
	
	function loadMenu(nodeId,text){
		datagrid = $("#FMenuManage").datagrid({
			title:text,
			method:"POST",
			url:getRootPath() + "admin/menu/GetMenuChildrenById",
			idField:'muId',
			rownumbers: true,
			fit:false,
			striped: true, //行背景交换
			fitColumns:true,
			singleSelect:true,
			queryParams: {          
				id: nodeId            
			},  
			loadFilter: function(data){
				if (data.code == 200){
					return data.data;
				}else{
					HandleException(data);
				}
			},
			columns:[[
			{
				field:'muId',
				title:"编号",
				width:10,
				align:'center',
			},{
				field:'muText',
				title:"菜单名称",
				width:30,
				align:'center',
				editor: { type: 'validatebox', options: { required: true} }
			},{
				field:'muCode',
				title:"菜单代码",
				width:40,
				align:'center',
				editor: { 
					type: 'validatebox', options: { required: true}
				}
			},{
				field:'muType',
				title:"菜单类型",
				width:40,
				align:'center',
				formatter:function(val){  
					if(val == 0){
						return "普通菜单";
					}else{
						return "按钮菜单";
					}
				},  
				editor:{//编辑选项  
					type:'combobox',  
					options:{
						valueField: 'value',  
						textField: 'text',  
						data: [ { 'value': '0', 'text': '普通菜单'},{ 'value': '1', 'text': '按钮菜单' }]  
					}
				}  
			},{
				field:'muIconcls',
				title:"图标",
				width:40,
				align:'center',
				editor: { 
					type: 'validatebox',
				}
			},{
				field:'muUrl',
				title:"菜单地址",
				width:70,
				align:'center',
				editor: { type: 'validatebox'}
			},{
				field:'muState',
				title:"状态",
				width:30,
				align:'center',
				editor:{//编辑选项  
					type:'combobox',  
					options:{
						valueField: 'value',  
						textField: 'text',  
						data: [ { 'value': 'open', 'text': 'open'},{ 'value': 'closed', 'text': 'closed' }]  
					}
				}  
			},{
				field:'muChecked',
				title:"是否选中",
				width:30,
				align:'center',
				editor:{//编辑选项  
					type:'combobox',  
					options:{
						valueField: 'value',  
						textField: 'text',  
						data: [{ 'value': 'false', 'text': 'false' }, { 'value': 'true', 'text': 'true'}]  
					}
				}  
			}
			]],
			toolbar:'#toolbar',
			onBeforeLoad:function(){
				$("#save").hide();
				$("#cancle").hide();
			},
			onLoadSuccess: function(row){
				datagrid.datagrid("unselectAll");
			},
			onBeforeEdit:function(index,row){
				$("#save").show();
				$("#cancle").show();
			},
			onAfterEdit:function(index,row){
				$.ajax({
					url:getRootPath() + 'admin/menu/UpdateMenu',
					type:'post',
					dataType: 'json',
					data: {  
						"muId" : row.muId,
						"muText":row.muText,
						"muCode":row.muCode,
						"muIconcls":row.muIconcls,
						"muUrl":row.muUrl,
						"muType":row.muType,
						"muChecked":row.muChecked,
						"muState":row.muState,
						"muPid":nodeId
					},
					success:function(data){
						if(data.code == 200){
							$("#save").hide();
							$("#cancle").hide();
							editRow = undefined;
							$("#tt").tree("reload");
							datagrid.datagrid("reload",editRow);
							datagrid.datagrid("unselectAll");
						}else{
							HandleException(data);
						}
					},
					error:function(e){
						$("#save").show();
						$("#cancle").show();
						$.messager.alert("提示消息", e.message,"error");
					}
				});
			},
		});
	}
	
	$("#add").click(function(){
		//添加时先判断是否有开启编辑的行，如果有则把开户编辑的那行结束编辑
		if (editRow != undefined) {
			datagrid.datagrid("endEdit", editRow);
		}
		//添加时如果没有正在编辑的行，则在datagrid的最后追加
		if (editRow == undefined) {
			var index = datagrid.datagrid("appendRow", {
				muText: '',
				muIconcls: 'icon-node',
				muChecked:'false',
				muState:'open',
				muUrl: '',
				muType:'0'
			}).datagrid('getRows').length-1;;
			//将新插入的那一行开户编辑状态
			datagrid.datagrid("beginEdit", index);
			datagrid.datagrid("checkRow",index);
			//给当前编辑的行赋值
			editRow = index;
		}
	});
	
	$("#edit").click(function(){
		//修改时要获取选择到的行
		var rows = datagrid.datagrid("getSelections");
		//如果只选择了一行则可以进行修改，否则不操作
		if (rows.length == 1) {
			//修改之前先关闭已经开启的编辑行，当调用endEdit该方法时会触发onAfterEdit事件
			if (editRow != undefined) {
				datagrid.datagrid("endEdit", editRow);
			}
			//当无编辑行时
			if (editRow == undefined) {
				//获取到当前选择行的下标
				var index = datagrid.datagrid("getRowIndex", rows[0]);
				//开启编辑
				datagrid.datagrid("beginEdit", index);
				//把当前开启编辑的行赋值给全局变量editRow
				editRow = index;
				//当开启了当前选择行的编辑状态之后，
				//应该取消当前列表的所有选择行，要不然双击之后无法再选择其他行进行编辑
				//datagrid.datagrid("unselectAll");
			}
		}else{
			$.messager.alert("编辑提示", "请选择要进行编辑的行");
		}
	});
	
	$("#save").click(function(){
		//保存时结束当前编辑的行，自动触发onAfterEdit事件如果要与后台交互可将数据通过Ajax提交后台
		datagrid.datagrid("endEdit", editRow);
		editRow = undefined;
	});
	
	$("#cancle").click(function(){
		datagrid.datagrid('cancelEdit',editRow)
		editRow = undefined;
		datagrid.datagrid("unselectAll");
		//添加时取消新增的一行还在，暂时用刷新页面的方法
		datagrid.datagrid("reload");
		$("#save").hide();
		$("#cancle").hide();
	});
	
	$("#delete").click(function(){
		doDelete();
	});
	
	$("#up").click(function(){
		MoveUp();
	});
	
	$("#down").click(function(){
		MoveDown();
	});

	//上移
	function MoveUp() {
		var row = datagrid.datagrid("getSelected");
		if (row != null) {
			var index =datagrid.datagrid('getRowIndex', row);
			mysort(index, 'up', datagrid);
		}else{
			$.messager.alert("移动提示", "请选择要进行移动的行");
		}
	}
	//下移
	function MoveDown() {
		var row = datagrid.datagrid("getSelected");
		if (row != null) {
			var index = datagrid.datagrid('getRowIndex', row);
			mysort(index, 'down',datagrid);
		}else{
			$.messager.alert("移动提示", "请选择要进行移动的行");
		}

	}


	function mysort(index, type, datagrid) {
		if ("up" == type) {
			if (index != 0) {
				var toup = datagrid.datagrid('getData').rows[index];
				var todown = datagrid.datagrid('getData').rows[index - 1];

				datagrid.datagrid('getData').rows[index] = todown;
				datagrid.datagrid('getData').rows[index - 1] = toup;
				exchange(toup.muId,todown.muId);
				datagrid.datagrid('refreshRow', index);
				datagrid.datagrid('refreshRow', index - 1);
				datagrid.datagrid('selectRow', index - 1);
			}
		} else if ("down" == type) {
			var rows = datagrid.datagrid('getRows').length;
			if (index != rows - 1) {
				var todown = datagrid.datagrid('getData').rows[index];
				var toup = datagrid.datagrid('getData').rows[index + 1];
				datagrid.datagrid('getData').rows[index + 1] = todown;
				datagrid.datagrid('getData').rows[index] = toup;
				exchange(toup.muId,todown.muId);
				datagrid.datagrid('refreshRow', index);
				datagrid.datagrid('refreshRow', index + 1);
				datagrid.datagrid('selectRow', index + 1);
			}
		}
	}

	function exchange(position1,position2){
		$.ajax({
			url:getRootPath() + 'admin/menu/ExchangeMenuPosition',
			type:'post',
			dataType: 'json',
			data: {  
				"id1" : position1,
				"id2":position2,
			},
			success:function(data){
				if(data.code != 200){
					HandleException(data);
				}
			},
			error:function(e){
				$.messager.alert("提示消息", e.message,"error");
			}
		});
	}


	//删除数据
	function doDelete() {
		var selectRows =datagrid.treegrid("getSelections");
		if (selectRows.length < 1) {
			$.messager.alert("提示消息", "请选择要删除的菜单!");
			return;
		}
		//提醒用户是否是真的删除数据
		$.messager.confirm("确认消息", "您确定要删除菜单【"+selectRows[0].muText+"】吗？", function (r) {
			if (r) {
				MaskUtil.mask();
				$.ajax({
					url: getRootPath() + "admin/menu/DeleteMenuById",
					type: "post",
					dataType: "json",
					data:{"id": selectRows[0].muId},
					success: function (data) {
						MaskUtil.unmask();
						if(data.code == 200){
							datagrid.datagrid("reload");
							datagrid.datagrid("clearSelections");
							$("#tt").tree("reload");
						}else{
							HandleException(data);
						}
					}
				});
			}
		});
	}

});