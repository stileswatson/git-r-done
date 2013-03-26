/**
 * @author Stiles
 */
$(document).ready(function(){
	var uncompletedToDoList = new ToDoList($("#ToDo_list_ol"), true),
	completedToDoList = new ToDoList($("#ToDo_list_completed"), false);
	
	/************** Begin ToDolist Class **************/
	function ToDoList(list, sortable) {
		if(list.jquery){ this.$list = list; }
		else if(typeof list !== "undefined"){ this.$list = $(list); }
		else { return false; }
	
		this._sortable = sortable;
		this._editMode = false;
		this._arrowImg = "<span class='ui-icon ui-icon-arrowthick-2-n-s'></span>";
		this._standardControls = "<ol class='ToDo-standard-controls'><li class='ToDo-edit'><span class='ui-icon ui-icon-pencil'></span></li><li class='ToDo-delete'><span class='ui-icon ui-icon-trash'></span></li></ol>";
		this._editingControls = "<ol class='ToDo-editing-controls'><li class='ToDo-save'><span class='ui-icon ui-icon-disk'></span></li><li class='ToDo-cancel'><span class='ui-icon ui-icon-cancel'></span></li><li class='ToDo-delete'><span class='ui-icon ui-icon-trash'></span></li></ol>";
		this._deleteControls = "<ol class='ToDo-delete-controls'><li class='ToDo-delete'><span class='ui-icon ui-icon-trash'></span></li></ol>";
		
		if(this._sortable) {
			this.$list.sortable({
				update: function(){
					var $item;
					for(var i = 0; i < $(this).children().length; i++)
					{
						$item = $($(this).children()[i]);
						localStorage.setItem("TDUC"+i,$item.find("p").text());
					}
				}
			});
		}
	}
	
	ToDoList.prototype.updateLocalStorage = function() {
		var $item;
		if(this._sortable) {
			var i;
			for(i = 0; i < this.$list.children().length; i++)
			{
				$item = $(this.$list.children()[i]);
				localStorage.setItem("TDUC"+i,$item.find("p").text());
			}
			if(localStorage.length > this.$list.children().length) {
				var start = i,
				end = localStorage.length;
				for(i = start; i < end; i++)
				{
					if(localStorage.getItem("TDUC"+i))
					{
						localStorage.removeItem("TDUC"+i);
					}
					else {
						break;
					}
				}
			}
		}
		else {
			for(var i = 0; i < this.$list.children().length; i++)
			{
				$item = $(this.$list.children()[i]);
				localStorage.setItem("TDC"+i,$item.find("p").text());
			}
			if(localStorage.length > this.$list.children().length) {
                var start = i,
                end = localStorage.length;
                for(i = start; i < end; i++)
                {
                	if(localStorage.getItem("TDC"+i))
                	{
                		localStorage.removeItem("TDC"+i);
                	}
                	else {
                		break;
                	}
                }
			}
		}
	};
	
	ToDoList.prototype.Init = function() {
		var $h1 = this.$list.siblings("header").children("h1");
		if($h1.hasClass("counter-off")) {
			$h1.append(": <b></b>");
			$h1.removeClass("counter-off");
			$h1.addClass("counter-on");
		}
		var key, value,
		    lsLength = localStorage.length;
		if(this._sortable) {
			for(var i = 0; i < lsLength; i++)
			{
				/*key = localStorage.key(i);
				if(key.substr(0,4) == "TDUC") {
					value = localStorage.getItem(key);
					this.addNewItem(value);
				}*/
                key = "TDUC"+i;
                if(localStorage.getItem(key)) {
    				value = localStorage.getItem(key);
					this.addNewItem(value);
				}
				else {
					break;
				}
			}
		}
		else {
			for(var i = 0; i < lsLength; i++)
			{
				key = "TDC"+i;
                if(localStorage.getItem(key)) {
					value = localStorage.getItem(key);
					this.addNewItem(value);
				}
				else {
					break;
				}
			}
		}
		this.updateCounter();
	};
	
	ToDoList.prototype.addNewItem = function(task) {
		this.$list.append("<li class='ui-state-default rounded'><div class='ToDo-item-wrapper'><input type='checkbox'/><div class='ToDo-task-text-wrapper'/></div></div></li>");
		var $item = this.$list.children(":last");
		$item.append("<br style='clear:both;'>");
		
		var $textWrapper = $item.find(".ToDo-task-text-wrapper"),
		$itemWrapper = $item.find(".ToDo-item-wrapper");
		
		$textWrapper.append("<p class='ToDo-task-text cf'>"+task+"</p>");
		
		var index = this.$list.children().length - 1;
		if(this._sortable) {
			localStorage.setItem("TDUC"+index, task);
			$textWrapper.after(this._standardControls);
			$itemWrapper.prepend(this._arrowImg);
		}
		else {
			localStorage.setItem("TDC"+index, task);
			this.$list.children(":last").find("input[type='checkbox']").attr("checked", true);
			$textWrapper.after(this._deleteControls);
		}
		
		if(this.$list.hasClass("ToDo-hidden")){
			this.$list.hide();
			this.$list.removeClass("ToDo-hidden");
			this.$list.addClass("ToDo-display");
			this.$list.show();
		}
		this.updateCounter();
	}
	
	ToDoList.prototype.markItemComplete = function(item) {
		var $item;
		if(item.jquery) { $item = item; }
		else if(typeof item !== "undefined") { $item = $(item); }
		else { return false; }
		
		if($item.is(":checked")) {
			$item.addClass("ToDo-completed");
		}
		
		$item.parent().find(".ui-icon-arrowthick-2-n-s").remove();
	}
	
	ToDoList.prototype.markItemUncomplete = function(item) {
		var $item;
		if(item.jquery) { $item = item; }
		else if(typeof item !== "undefined") { $item = $(item); }
		else { return false; }
		
		if($item.not(":checked")) {
			$item.removeClass("ToDo-completed");
		}
		
		$item.parents("li:first").find(".ToDo-item-wrapper").prepend(this._arrowImg);
	}
	
	ToDoList.prototype.moveItemTo = function(item, toDoList) {
		var $item;
		if(item.jquery) { $item = item; }
		else if(typeof item !== "undefined") { $item = $(item); }
		else { return false; }
		
		var objList;
		if(typeof toDoList !== "undefined" && toDoList.$list) { objList = toDoList; }
		else { return false; }
		
		var $itemList = $item.parents("li:first");
		if($itemList.length <= 0) {
			return false;
		}
		
		if(this._sortable && this._editMode 
			&& $itemList.find("input[type='text'].ToDo-editor").length > 0) {
			this.restoreItem($itemList);
		}
		
		objList.appendItem($item);

		this.updateCounter();
		objList.updateCounter();
		this.updateLocalStorage();
		objList.updateLocalStorage();
		
		if($item.hasClass("ToDo-completed")) {
			$itemList.find("ol.ToDo-standard-controls").remove();
			$itemList.find(".ToDo-task-text-wrapper").after(this._deleteControls);
		}
		else {
			$itemList.find("ol.ToDo-delete-controls").remove();
			$itemList.find(".ToDo-task-text-wrapper").after(this._standardControls);
		}

		
		if(this.$list.children("li").length <= 0 && this.$list.hasClass("ToDo-display")) {
			this.$list.removeClass("ToDo-display");
			this.$list.addClass("ToDo-hidden");
		}
	}
	
	ToDoList.prototype.appendItem = function(item) {
		var $item;
		if(item.jquery) { $item = item; }
		else if(typeof item !== "undefined") { $item = $(item); }
		else { return false; }
		
		var $li = $item.parents("li:first"),
		    remIndex = $li.index();
		
		$li.appendTo(this.$list);
		var index = this.$list.children().length - 1;
		if(this._sortable) {
			localStorage.setItem("TDUC"+index, $li.find("p").text());
			localStorage.removeItem("TDC"+remIndex);
		}
		else {
			localStorage.setItem("TDC"+index, $li.find("p").text());
			localStorage.removeItem("TDUC"+remIndex);
		}
		
		if(this.$list.hasClass("ToDo-hidden")) {
			this.$list.removeClass("ToDo-hidden");
			this.$list.addClass("ToDo-display");
		}
	}
	
	ToDoList.prototype.removeItem = function(item) {
		var $item;
		if(item.jquery) { $item = item; }
		else if(typeof item !== "undefined") { $item = $(item); }
		else { return false; }
		
		if(this._sortable) {
			localStorage.removeItem("TDUC"+$item.index());
		}
		else {
			localStorage.removeItem("TDC"+$item.index());
		}
		$item.remove();
		this.updateCounter();
		this.updateLocalStorage();
		if(this.$list.children("li").length <= 0 && this.$list.hasClass("ToDo-display")) {
			this.$list.removeClass("ToDo-display");
			this.$list.addClass("ToDo-hidden");
			//clear any orphaned items
			var key,
			    lsLength = localStorage.length;
			if(this._sortable) {
				for(var i = 0; i < lsLength; i++)
				{
					key  = localStorage.key(i);
					if(key.substr(0,4) == "TDUC") {
						localStorage.removeItem(key);
					}
				}
			}
			else {
				for(var i = 0; i < lsLength; i++)
				{
					key  = localStorage.key(i);
					if(key.substr(0,3) == "TDC") {
						localStorage.removeItem(key);
					}
				}
			}
		}
	}
	
	ToDoList.prototype.editItem = function(item) {
		var $item;
		if(item.jquery) { $item = item; }
		else if(typeof item !== "undefined") { $item = $(item); }
		else { return false; }
		
		if(this._editMode) {
			var $toCancel = $("#ToDo_list_ol").find("input[type='text'].ToDo-editor").parents('li:first');
			this.restoreItem($toCancel);
		}
		this._editMode = true;
		var $task = $item.find("p");
		$task.remove();
		sessionStorage.setItem("org_value",$task.text());
		var $targetDiv = $item.find("div.ToDo-task-text-wrapper"),
		taskText = $task.text().replace(/\'/g,'&#39;').replace(/\"/g,'&#34;').replace(/\</g,'&#60;').replace(/\>/g,'&#62;');
		$targetDiv.append("<form id='ToDo_edit'><input type='text' class='ToDo-editor' value='"+taskText+"'/></form>");
		$item.find('ol.ToDo-standard-controls').remove();
		$targetDiv.after(this._editingControls);
		$(".ToDo-editor").focus();
	}
	
	ToDoList.prototype.saveItem = function(item) {
		var $item;
		if(item.jquery) { $item = item; }
		else if(typeof item !== "undefined") { $item = $(item); }
		else { return false; }
		
		this._editMode = false;
		var $task = $item.find("input.ToDo-editor");
		if(typeof $task === "undefined") { return false; }
		
		$item.find("#ToDo_edit").remove();
		$item.find(".ToDo-editing-controls").remove();
		var $targetDiv = $item.find("div.ToDo-task-text-wrapper"),
		taskText = $task.val().replace(/\'/g,'&#39;').replace(/\"/g,'&#34;').replace(/\</g,'&#60;').replace(/\>/g,'&#62;');;
		$targetDiv.append("<p class='ToDo-task-text cf'>"+taskText+"</p>");
		$targetDiv.after(this._standardControls);
	}
	
	ToDoList.prototype.restoreItem = function(item) {
		var $item;
		if(item.jquery) { $item = item; }
		else if(typeof item !== "undefined") { $item = $(item); }
		else { return false; }
		
		if(!this._editMode) {
			return false;
		}
		
		this._editMode = false;
		
		var org_text = sessionStorage.getItem("org_value");
		sessionStorage.removeItem("org_value");
		$item.find("#ToDo_edit").remove();
		$item.find("ol.ToDo-editing-controls").remove();
		var $targetDiv = $item.find("div.ToDo-task-text-wrapper");
		$targetDiv.append("<p class='ToDo-task-text cf'>"+org_text+"</p>");
		$targetDiv.after(this._standardControls);
		
	}
	
	ToDoList.prototype.updateCounter = function() {
		var $counter = this.$list.parents("section:first").children("header:first");
		if(typeof $counter !== "undefined") {
			var length = $counter.siblings(":first").children("li").length;
			if(typeof length !== "undefined") {
				$counter.children("h1").children("b").text(length);
			}
			else {
				$counter.children("h1").children("b").text(0);
			}
		}
	}
	/************** End ToDolist Class **************/
	
	$("#ToDo_adder").submit(function(){
		var task = $("#ToDo_new").val();
		if(task != null && task != "") {
			$("#ToDo_new").val("");
			uncompletedToDoList.addNewItem(task);
		}
		$("#ToDo_new").focus();
		return false;
	});
	
	$(document).on("submit", "#ToDo_edit", function(){
		uncompletedToDoList.saveItem($(this).parents(".rounded:first"));
		return false;
	});
	
	$(window).blur(function() {
		if(uncompletedToDoList._editMode) {
			uncompletedToDoList.restoreItem($("input[type='text'].ToDo-editor").parents("li:first"));
		}
	});
	
	$("html").click(function(e){
		var e = (e) ? e : element,
		element = e.target || e.srcElement,
		$element = $(element);
		if($element.attr("type") == "checkbox" && $element.is(":checked")) {
			uncompletedToDoList.markItemComplete($element);
			uncompletedToDoList.moveItemTo($element, completedToDoList);
		}
		else if($element.attr("type") == "checkbox" && $element.not(":checked")) {
			completedToDoList.markItemUncomplete($element);
			completedToDoList.moveItemTo($element, uncompletedToDoList);
		}
		else if($element.hasClass("ui-icon-trash")) {
			if(confirm("Are you sure you want to delete this item?")) {
				if($element.parents("#ToDo_list_ol").length > 0) {
					uncompletedToDoList.removeItem($element.parents(".rounded:first"));
				}
				else {
					completedToDoList.removeItem($element.parents(".rounded:first"));
				}
			}
		}
		else if($element.hasClass("ui-icon-pencil") || $element.hasClass("ToDo-task-text")) {
			if($element.parents("#ToDo_list_ol").length > 0) {
				uncompletedToDoList.editItem($element.parents(".rounded:first"));
			}
		}
		else if($element.hasClass("ui-icon-disk")) {
			if($element.parents("#ToDo_list_ol").length > 0) {
				uncompletedToDoList.saveItem($element.parents(".rounded:first"));
			}
		}
		else if($element.hasClass("ui-icon-cancel")) {
			if($element.parents("#ToDo_list_ol").length > 0) {
				uncompletedToDoList.restoreItem($element.parents(".rounded:first"));
			}
		}
	});
	
	uncompletedToDoList.Init();
	completedToDoList.Init();
});
