// JavaScript Document
$(document).ready(function() {

	switch(page_globals.modo) {
		
		case 'tool_time_machine' :
				component_portal.hide_buttons_and_tr_edit_content();
				break;
		case 'tool_lang' :
				break;
		case 'edit' :
				break;													
	}
	// ADD DELETE CONFIRMATION DIALOG TEXT
	$('body').append( '<!-- ui-dialog -->\
						<div id="delete_dialog_portal" title="Delete portal">\
						<p>'+get_label.esta_seguro_de_borrar_este_registro+'</p>\
						</div>\
						' );
	
	// Update style of portal row taps and content
	//component_portal.portal_tap_style_update();
	
});

// JQUERY UI CONFIRMATION DIALOG AND DELETE ACTION 
$(function(){

	// DELETE DIALOG 
	$('#delete_dialog_portal').dialog({
				
		autoOpen: false,	
		width: 600,
		closeOnEscape: true,
		modal: true,
		buttons: {
		
			Cancel : function() {
				//console.log($(this).data('button_obj'));
				$(this).dialog("close");
			},							
			"Delete only link": function() {				
				component_portal.remove_locator_from_portal($(this).data('button_obj'),'delete_link');
				$(this).dialog("close");
			},			
			"Delete resource and all links": function() {
				component_portal.remove_resource_from_portal($(this).data('button_obj'),'delete_all');
				$(this).dialog("close");
			},				
		}			
	});
	// Asignamos varianles traducidas a los botones del dialog
	$('.ui-dialog-buttonpane button:contains(Cancel)').find('span').html(get_label.cancelar);
	$('.ui-dialog-buttonpane button:contains(Delete only link)').find('span').html(get_label.borrar_solo_el_vinculo);
	$('.ui-dialog-buttonpane button:contains(Delete resource and all links)').find('span').html(get_label.borrar_el_recurso);
	
});//$(function()


/**
* COMPONENT PORTAL CLASS
*/
var component_portal = new function() {

	// URL TRIGGER
	this.url_trigger = DEDALO_LIB_BASE_URL + '/component_portal/trigger.component_portal.php';	

	this.save_arguments = {	"update_security_access"	: false,
							"update_filter_master"		: false,
							} // End save_arguments

	// Active button obj
	this.active_delete_button_obj = null;


	/**
	* REMOVE RESOURCE FROM PORTAL
	*/
	this.remove_locator_from_portal = function (button_obj) {
		
		// Component wrap
		var component_wrap 	= $(button_obj).parents('.css_wrap_portal').first();
			if (component_wrap.length!==1) return alert("Error on select component wrap");

		// vars
		var vars = new Object();
			vars.portal_tipo 	= $(component_wrap).data('tipo'),
			vars.portal_id		= $(component_wrap).data('id_matrix'),
			vars.portal_parent	= $(component_wrap).data('parent'),
			vars.rel_locator 	= $(button_obj).data('rel_locator');
		// Verify vars values
		if(!test_object_vars(vars,'remove_locator_from_portal')) return false;

		var mode 		= 'remove_locator_from_portal';
		var mydata		= { 'mode': mode, 'portal_tipo':vars.portal_tipo, 'portal_id':vars.portal_id, 'portal_parent':vars.portal_parent, 'rel_locator':vars.rel_locator };		

		// Component wrapper id (for update component content after delete element)
		var id_wrapper 	= $(button_obj).parents('.css_wrap_portal').first().attr('id'),
			target_obj	= $('#'+id_wrapper);
			//return alert("id_wrapper:"+id_wrapper+" - portal_tipo:"+vars.portal_tipo+" - rel_locator:"+vars.rel_locator+ " - this.resource_trigger_url:"+this.url_trigger)		

		html_page.loading_content( target_obj, 1 );
	
		// AJAX CALL
		$.ajax({
			url			: this.url_trigger,
			data		: mydata,
			type		: "POST"
		})
		// DONE
		.done(function(data_response) {

			// Search 'error' string in response
			var error_response = /error/.test(data_response);

			// If data_response contain 'error' show alert error with (data_response) else reload the page
			if(error_response != false) {
				// Alert error
				alert("[remove_locator_from_portal] Request failed: \n" + data_response );
			}else{
				// Espected value string ok
				if(data_response=='ok') {				
					
					// Reload component by ajax
					component_common.load_component_by_wrapper_id(id_wrapper);

					// Notify to inspector
					top.inspector.show_log_msg("<span class='ok'>Removed resource "+vars.rel_locator+"</span>");	
				
				}else{
					alert("[remove_locator_from_portal] Warning: " + data_response, 'Warning');
				}
			}
			if (DEBUG) console.log("->remove_locator_from_portal: " + data_response)			
		})
		.fail( function(jqXHR, textStatus) {					
			// log
			top.inspector.show_log_msg( "<span class='error'>Error on " + getFunctionName() + " [rel_locator] " + vars.rel_locator + "</span>" + textStatus );
		})
		.always(function() {			
			html_page.loading_content( target_obj, 0 );																							
		})		
	}// /this.remove_locator_from_portal



	/**
	* REMOVE RESOURCE FROM PORTAL
	*/
	this.remove_resource_from_portal = function (button_obj, action) {
		
		// Component wrap
		var component_wrap 	= $(button_obj).parents('.css_wrap_portal').first();
			if (component_wrap.length!==1) return alert("Error on select component wrap");

		// vars
		var vars = new Object();
			vars.portal_tipo 	= $(component_wrap).data('tipo'),
			vars.portal_id		= $(component_wrap).data('id_matrix'),
			vars.portal_parent	= $(component_wrap).data('parent'),
			vars.rel_locator 	= $(button_obj).data('rel_locator');
		// Verify vars values
		if(!test_object_vars(vars,'remove_resource_from_portal')) return false;

		// test is locator call to full resource like '4521.0.0'
		//var resource_is_full = /.0.0/.test(vars.rel_locator);
		//	return alert('is_full:'+resource_is_full)

		// Confirm action
		if( !confirm("Sure ?") )  return false;	

		var mode 		= 'remove_resource_from_portal';
		var mydata		= { 'mode': mode, 'portal_tipo':vars.portal_tipo, 'portal_id':vars.portal_id, 'portal_parent':vars.portal_parent, 'rel_locator':vars.rel_locator };		

		// Component wrapper id (for update component content after delete element)
		var id_wrapper 	= $(button_obj).parents('.css_wrap_portal').first().attr('id'),
			target_obj	= $('#'+id_wrapper);
			//return alert("id_wrapper:"+id_wrapper+" - portal_tipo:"+vars.portal_tipo+" - rel_locator:"+vars.rel_locator+ " - this.resource_trigger_url:"+this.url_trigger)		

		html_page.loading_content( target_obj, 1 );
	
		// AJAX CALL
		$.ajax({
			url			: this.url_trigger,
			data		: mydata,
			type		: "POST"
		})
		// DONE
		.done(function(data_response) {

			// Search 'error' string in response
			var error_response = /error/.test(data_response);

			// If data_response contain 'error' show alert error with (data_response) else reload the page
			if(error_response != false) {
				// Alert error
				alert("[remove_resource_from_portal] Request failed: \n" + data_response );
			}else{
				// Espected value string ok
				if(data_response=='ok') {				
					
					// Reload component by ajax
					component_common.load_component_by_wrapper_id(id_wrapper);

					// Notify to inspector
					top.inspector.show_log_msg("<span class='ok'>Removed resource "+vars.rel_locator+"</span>");	
				
				}else{
					alert("" + data_response,'Warning');
				}
			}
			//if (DEBUG) console.log("->remove_resource_from_portal: " + data_response)	
				
		})
		.fail( function(jqXHR, textStatus) {					
			// log
			top.inspector.show_log_msg( "<span class='error'>Error on " + getFunctionName() + " [rel_locator] " + vars.rel_locator + "</span>" + textStatus );
		})
		.always(function() {			
			html_page.loading_content( target_obj, 0 );																							
		})

	}// /this.remove_resource_from_portal



	/**
	* HIDE BUTTONS AND CONTENT
	* usado en los listados de time machine
	*/
	this.hide_buttons_and_tr_edit_content = function() {
		$(function(){	
			//$('.section_edit_in_portal_content, .btn_new_ep, .css_button_delete').hide(0);
			$('.delete_portal_link, .th_large_icon, TR[class*="portal_tr_edit_"]').remove(0);
		});
	}

	/**
	* PORTAL TAP STATE UPDATE
	* Update only specific style of row portal tabs. NOT affect if show or hide content (controled by: html_page.taps_state_update)
	*/
	this.portal_tap_style_update__DEPRECATED = function() {
		
		$(document).ready(function() {
			/**/
			//alert("called portal_tap_style_update")

			// TAP OBJ SELECTOR
			var portal_tap_title_obj = $('.section_edit_in_portal_td').children('.tap_title');

			// INITIAL ITERATION TO SHOW / HIDE TAPS	
			portal_tap_title_obj.each(function() {
				
				var tap_id = $(this).data('tap_id');					//alert( tap_id );	
				if(tap_id != null) {
					var tap_value	= get_localStorage(tap_id);			//alert("tap_value:"+tap_value)

					// TOOGLE DIV IF EXISTS COOKIE
					if(tap_value != 1) {
						component_portal.open_row_edit( $(this) );		//alert("tap_value is 1. open row "+tap_id)
					}
				}
				//$(this).next('.tap_content').toggle(0);
			});
			
		});
	}

	/**
	* NEW PORTAL RECORD
	* Create new section record and add to current portal
	*/
	this.new_portal_record = function (button_obj) {
		
		var portal_id 			= $(button_obj).data('portal_id'),
			portal_tipo 		= $(button_obj).data('portal_tipo'),
			target_section_tipo	= $(button_obj).data('target_section_tipo');
		
		var wrap_div 			= $(button_obj).parents('.wrap_component:first');		

		// Test mandatory vars
		if (portal_id<1)
			return alert("new_portal_record Error: portal_id is empty! \n Is possible that this record is previous and don´t have portal record \n Nothing is done.");
		if (typeof target_section_tipo=='undefined' || target_section_tipo.length<3)
			return alert("new_portal_record Error: target_section_tipo is empty! \n Nothing is done.");
		if ( $(wrap_div).length<1 )
			return alert("new_portal_record Error: wrap_div is empty! \n Nothing is done.");		

		var mode 	= 'new_portal_record';
		var mydata	= { 'mode': mode, 'portal_id': portal_id, 'portal_tipo': portal_tipo, 'target_section_tipo': target_section_tipo };

			//return alert('portal_id:'+ portal_id+ ' - portal_tipo:'+ portal_tipo + ' - target_section_tipo:'+ target_section_tipo  )

		html_page.loading_content( wrap_div, 1 );

		// AJAX REQUEST
		$.ajax({
			url		: this.url_trigger,
			data	: mydata,
			type 	: "POST"
		})
		// DONE
		.done(function(received_data) {

			// Response new 'id_matrix' expected
			if ($.isNumeric(received_data) && received_data>0) {

				// Reload component
				var wrapper_id 	= $(wrap_div).attr('id');
				component_common.load_component_by_wrapper_id( wrapper_id, null, function() {

					// Callback functions
						// Update taps state
						html_page.taps_state_update();
						// Update portal taps style
						//component_portal.portal_tap_style_update();
						// Init possible text_areas inside block loaded
						jQuery.each( $(wrap_div).find('textarea'), function() {
							var textarea_id = $(this).attr('id');
							// Init current text area editor by id
							text_editor.init(textarea_id);
						});
						html_page.loading_content( wrap_div, 0 );	//alert('wrapper_id:'+wrapper_id)

				});//end load_component_by_wrapper_id

				// Notification msg ok
				var msg = "<span class='ok'>New portal record: " + received_data + "</span>";
					inspector.show_log_msg(msg);

				/*
				// Open dialog window to edit new record created
				// Simulate and configure button_obj to call edit on dialog window
				var button_obj = new Object();
				$(button_obj).data('id_matrix',received_data);
				$(button_obj).data('caller_id',portal_id);
				component_portal.edit_on_dialog_window( $(button_obj) );
				*/
			}else{
				// Warning msg
				var msg = "<span class='warning'>Warning on create new_portal_record: \n" + received_data +"</span>" ;
					inspector.show_log_msg(msg);
					alert( $(msg).text() )
			}
			
		})
		// FAIL ERROR 
		.fail(function(error_data) {
			// Notify to log messages in top of page
			var msg = "<span class='error'>ERROR: on new_portal_record data portal_id:" + portal_id + "<br>Data is NOT saved!</span>";				
			inspector.show_log_msg(msg);
			if (DEBUG) console.log(error_data);
			html_page.loading_content( wrap_div, 0 );
		})
		// ALLWAYS
		.always(function() {
			/*
			setTimeout(function(){
				html_page.loading_content( wrap_div, 0 );
				alert("triggered setTimeout")
			}, 6);	
			*/		
		})

	}//enf new_portal_record



	/**
	* OPEN_TR_EDIT
	*/
	this.open_tr_edit = function (button_obj) {	
		
		// vars
		var vars = new Object();
			vars.portal_tr_edit = $(button_obj).data('portal_tr_edit'),
			vars.portal_tr_list = $(button_obj).data('portal_tr_list'),
			vars.id_wrapper		= $(button_obj).data('id_wrapper'),
			vars.common_row_id	= $(button_obj).data('common_row_id');
		// Verify vars values
		if(!test_object_vars(vars, 'open_tr_edit')) return false;

		// ROW EDIT : current html lengh
		var current_html_lenght = $('.portal_tr_edit_'+vars.common_row_id).find('.css_section_content').html().length ;

		// Close and clean all common rows edit
		// ROW EDIT : Hide
		$('.portal_tr_edit_'+vars.common_row_id).css('display','none');
		// ROW EDIT : Empty content html
		$('.portal_tr_edit_'+vars.common_row_id).find('.css_section_content').html('<div class=\"portal_loading_msg\">Loading..</div>');
		/*
		$('.portal_tr_edit_'+vars.common_row_id).find('.css_section_content').each(function() {					  
		  $(this).css('display','none');
		  $(this).html('Loading..');		
		});
		*/

		// ROW LIST : Show all common rows list
		$('.portal_tr_list_'+vars.common_row_id).css('display','table-row');
			
		$(function() {
			// Ajax load section
			if($('#'+vars.id_wrapper).length != 1) return alert("Error: wrong target_row_id:"+vars.id_wrapper+" n:"+$('#'+vars.id_wrapper).length);

			//if (current_html_lenght<100) {}
			component_common.load_section_by_ajax(vars.id_wrapper);	//, arguments, callback
						
			//console.log("called function")
		});//$(function()
		
		// ROW LIST : Hide current tr list
		$('#'+vars.portal_tr_list).css('display','none');

		// ROW EDIT : Show current tr edit		
		$('#'+vars.portal_tr_edit).css('display','table-row');			
	}

	/**
	* CLOSE_TR_EDIT
	*/
	this.close_tr_edit = function (button_obj) {
		
		// vars
		var vars = new Object();
			vars.portal_tr_edit = $(button_obj).data('portal_tr_edit'),
			vars.portal_tr_list = $(button_obj).data('portal_tr_list');
		// Verify vars values
		if(!test_object_vars(vars, 'open_tr_edit')) return false;

		// ROW EDIT : Close curent tr edit
		$('#'+vars.portal_tr_edit).css('display','none');//.find('.css_section_content').html('')

		// ROW LIST : Open current tr list
		$('#'+vars.portal_tr_list).css('display','table-row');
	}


	

	/**
	* TOGGLE_MORE_ELEMENTS_CONTENT
	* Desplega los elementos plegados en los listados
	*/
	this.toggle_more_elements_content = function (button_obj) {

		if ( $(button_obj).hasClass('portal_toggle_more_elements_minus') ) {
			// Is opened. Closing
			$(button_obj).parents('.row_portal_inside').first().find('.portal_more_elements_content').fadeOut(300);
			$(button_obj).removeClass('portal_toggle_more_elements_minus');

		}else{
			// Is close. Opening
			$(button_obj).parents('.row_portal_inside').first().find('.portal_more_elements_content').fadeIn(300);
			$(button_obj).addClass('portal_toggle_more_elements_minus');
		}
	}
	
	

}