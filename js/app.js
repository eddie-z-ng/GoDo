$(function () {

	var GODO_APP = "godo-app-js";
	/* 0 = Active, 1 = Complete */
	var godoTaskList = JSON.parse(localStorage.getItem(GODO_APP)) || [
						{task: "Walk the dog", status: 0},
						{task: "Buy groceries", status: 0},
						{task: "Call mom", status: 0}
					   ];

	/* Filter selection */
	var selectedFilter = -1;
	
	var $filterAll = $('#filter-all').find('.filter-button');
	var $filterActive = $('#filter-active').find('.filter-button');
	var $filterComplete = $('#filter-complete').find('.filter-button');
	var $filterAllCount = $('#filter-all').find('.filter-count');
	var $filterActiveCount = $('#filter-active').find('.filter-count');
	var $filterCompleteCount = $('#filter-complete').find('.filter-count');
	
	var $godoList = $('.godolist');
	var $godoInputForm = $('#inputForm');
	
	function updateTaskCounts() {
		var allCount = godoTaskList.length;
		var activeCount = 0, completeCount = 0;
		for (var idx = 0; idx < godoTaskList.length; idx++) {
			if (godoTaskList[idx].status === 0) {
				activeCount++;
			}
		}
		completeCount = allCount - activeCount;
		
		/* Update task counts */
		$filterAllCount.text('('+allCount+')');
		$filterActiveCount.text('('+activeCount+')');
		$filterCompleteCount.text('('+completeCount+')');
		
		/* Save to localStorage */
		localStorage.setItem(GODO_APP, JSON.stringify(godoTaskList));
	}
	
	function updateDisplayList(selectedFilter) {
		var $listItems = $('.godolist li');
		switch (selectedFilter)
		{
			case -1: /* no filter - all */
				$listItems.each(function(idx) {
					$(this).removeClass('hide-item');
			});
			break;
			
			case 1: /* complete */
				$listItems.each(function(idx) {
					if ($(this).find('.check-task').hasClass('completed')) {
						//console.log( idx + ": " + $( this ).text());
						$(this).removeClass('hide-item');
					} else {
						$(this).addClass('hide-item');
					}
				});
			break;
			
			case 0: /* active */
			default:
				$listItems.each(function(idx) {
					//console.log( idx + ": " + $( this ).text());
					if ($(this).find('.check-task').hasClass('completed')) {
						//console.log( idx + ": " + $( this ).text());
						$(this).addClass('hide-item');
					} else {
						$(this).removeClass('hide-item');
					}
				});
			break;
		}
	}
		
	function addTaskElement(todo_task) {
		var $taskList = $('.godolist');
		var elementToAdd = $('<li class="border border-gray rounded-corners">' +
			                     '<div class="button-container"><button class="check-task">' +
								 '<div class="checkMark"></div></button></div>' + 
                        		 '<div class="task-text"></div>' +
								 '<form class="edit-task hide-item">' +
								 '<input type="text" class="edit-task-text"/>' +
								 '</form><button class="delete-task"></button></li>')
			
		$('.task-text', elementToAdd).addClass('unselectable');
		$('.task-text', elementToAdd).text(todo_task.task);
		$('.edit-task-text', elementToAdd).attr("value", todo_task.task);
		if (todo_task.status === 1) {
			$('.check-task', elementToAdd).addClass('completed');
		}
		if (selectedFilter !== -1 && selectedFilter !== todo_task.status) { 
			elementToAdd.addClass('hide-item');
		}  	
		$taskList.append(elementToAdd);
	}
	
	/* Setup event handler for filtering tasks */
	$filterAll.click(function() {
		if ($filterAll.hasClass('selected-filter')) {
			return;
		} else {
			$filterAll.addClass('selected-filter');
			$filterActive.removeClass('selected-filter');
			$filterComplete.removeClass('selected-filter');
			selectedFilter = -1;	
			updateDisplayList(selectedFilter);
		}		
	});
	
	$filterActive.click(function() {
		if ($filterActive.hasClass('selected-filter')) {
			return;
		} else {
			$filterAll.removeClass('selected-filter');
			$filterActive.addClass('selected-filter');
			$filterComplete.removeClass('selected-filter');
			selectedFilter = 0;
			updateDisplayList(selectedFilter);
		}
	});
	
	$filterComplete.click(function() {
		if ($filterComplete.hasClass('selected-filter')) {
			return;
		} else {
			$filterAll.removeClass('selected-filter');
			$filterActive.removeClass('selected-filter');
			$filterComplete.addClass('selected-filter');
			selectedFilter = 1;
			updateDisplayList(selectedFilter);
		}
	});
		
	/* Setup event handler for inputting new tasks */
	$godoInputForm.submit(function(e) {
		var inputTask = $('#input-task').val();
		if (inputTask !== '') {
			var pendingTask = {task: inputTask, status: 0}; 
			addTaskElement(pendingTask);
			godoTaskList.push(pendingTask); /* 0 = Active, 1 = Complete */
			updateTaskCounts();
		}
		$('#input-task').val('').blur(); /* Clear the input field */
		e.preventDefault();
	});
	
	/* Delegate future events on tasks */
	$godoList.on("click", ".delete-task", function(e) {
		listIndex = $(this).parent().index();
		godoTaskList.splice(listIndex, 1);
		$(this).parent().remove();
		updateTaskCounts();
		e.preventDefault();
	});
				
	$godoList.on("click", ".check-task", function(e) {
		listIndex = $(this).parent().parent().index();
		godoTaskList[listIndex].status ^= 1;
		//console.log(listIndex + " status:" + godoTaskList[listIndex].status);
		$(this).toggleClass("completed");
		
		if (selectedFilter !== -1 && godoTaskList[listIndex].status !== selectedFilter) {
			$(this).parent().parent().addClass('hide-item');
		} else {
			$(this).parent().parent().removeClass('hide-item');
		}
		updateTaskCounts();
		e.preventDefault();
	});
	
	$godoList.on("submit", ".edit-task", function(e) {
		$(this).find('.edit-task-text').blur();
		e.preventDefault();
	});
	
	$godoList.on("blur", ".edit-task-text", function(e) {
		var taskText = $(this).val();
		var taskIndex = $(this).parent().parent().index();
		if (taskText) {
			godoTaskList[taskIndex].task = taskText;	
			//console.log($(this));
			$(this).parent().addClass('hide-item');
			$(this).parent().siblings('.task-text').removeClass('hide-item');
			$(this).parent().siblings('.task-text').text(taskText);
		} else {
			godoTaskList.splice(taskIndex, 1);
			$(this).parent().parent().remove();
			updateTaskCounts();
		}
		e.preventDefault();
	});
	
	$godoList.on("focus", ".edit-task-text", function(e) {
		//console.log("FOCUS EVENT");
		//$(this).parent().removeClass('hide-item');
		//$(this).parent().siblings('.task-text').addClass('hide-item');
		e.preventDefault();
	});
	
	$godoList.on("dblclick", ".task-text", function(e) {
		//console.log("Double Click event");
		$(this).siblings('.edit-task').removeClass('hide-item');
		
		$(this).siblings('.edit-task').find('.edit-task-text').focus();
		$(this).addClass('hide-item');
		e.preventDefault();
	});
		
	/* Initialize list of tasks */
	for (var idx = 0; idx < godoTaskList.length; idx++) {
		addTaskElement(godoTaskList[idx]);
	}	
	updateTaskCounts();
});