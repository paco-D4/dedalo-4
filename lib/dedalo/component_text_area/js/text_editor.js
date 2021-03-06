// JavaScript Document
// TEXT EDITOR


// TEXT EDITOR CLASS
var text_editor = new function() {

	// CONTEXT : Get from url
	var context = get_current_url_vars()['context'];

	
	/**
	* INIT
	* @param Propiedades es opcional. Si se pasa, será un string en formato json del tipo {"text_editor_options":"full"} 
	*/
	this.init = function (text_area_id, modo, propiedades) {
		//console.log(propiedades)	

		// Verify text_area_id is valid
		if (typeof text_area_id == 'undefined') return ;

		//if(DEBUG) console.log("->text_editor.init: "+text_area_id)

		var text_area_component = $('#'+text_area_id);
		var cssFile, editor_height ;
		
		switch(modo) {
			case 'tool_transcription' :
					cssFile 		= DEDALO_LIB_BASE_URL + '/component_text_area/css/' + 'text_editor_tool_transcription.css';
					editor_height 	= 597 -70;
					break;
			case 'tool_lang' :
					editor_height 	= 407 -70;
					//break;
			case 'tool_indexation' :
					editor_height 	= 250;
			default :
					cssFile = DEDALO_LIB_BASE_URL + '/component_text_area/css/' + 'text_editor_default.css';
		}

		// CONFIG DEFAULT				  
		var current_inline 	 = false,
			current_menubar  = false, 
			current_plugings = [
								"image print",
								"searchreplace code fullscreen",
								"paste wordcount"
								],
			current_toolbar  = "bold italic undo redo code fullscreen";
		
		
		// CONFIG CUSTOM PROPIEDADES (configure editor options in component propiedades)
		try {			
			//console.log(propiedades)
			if(typeof propiedades!='undefined' && propiedades!='null') {
				var propiedades_obj = $.parseJSON(propiedades);
				if( propiedades_obj.text_editor_options=='full') {
					// CONFIG CUSTOM
					current_menubar  = true,
					current_plugings = [
										"advlist autolink lists link image charmap print preview hr anchor pagebreak",
								        "searchreplace wordcount visualblocks visualchars code fullscreen",
								        "insertdatetime media nonbreaking save table contextmenu directionality",
								        "paste textcolor",
								        ]
					current_toolbar  = "insertfile undo redo | styleselect | bold italic forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image print preview "
				}
			}
		}catch(e){
			console.log(e); // pass exception object to error handler			
		}


		// INIT TINYMCE
		tinymce.init({
				selector :'#'+text_area_id,
				
				// CUSTOM OPTIONS
				inline	 : current_inline,
				menubar  : current_menubar, 
				plugins  : current_plugings,
				toolbar  : current_toolbar,				

				// ENCODING	
				entity_encoding		: "raw",

				// P : FORCE NO INSERT TINYMCE PARAGRAPS "<p>"		
				force_br_newlines	: true,		// need true for webkit
				force_p_newlines	: false,
				forced_root_block	: false, 	// Needed for 3.x				

				// SIZE :
				width 					: '100.5%',
				height 					: editor_height,				
				//autoresize_min_height	: 88,
				//autoresize_max_height	: 276,
				
				// CSS
				content_css 			: cssFile,
				//skin 					: 'lightgray',

				// IMAGES : Avoid user resize images
				object_resizing			: false,
				paste_block_drop 		: false,	// block drag images on true

				// HTML ELEMENTS ALLOWED
				valid_elements 			: "strong/b,em/i,div[class],span[class],img[id|src|class],br,p,apertium-notrans", //"strong/b,em/i,div[class],span[class],img[id|src|class],br,p",
				
				// This option enables or disables the element cleanup functionality. If you set this option to false, 
				// all element cleanup will be skipped but other cleanup functionality such as URL conversion will still be executed.
				verify_html 			: false,		// default false (IMPORTANT FOR IMAGE TAGS ALWAYS SET FALSE)	
				apply_source_formatting : false,			

				// Gestion de URL's por tiny. Default is both true
				relative_urls			: false,
				convert_urls			: false,					

				// TESTING
				remove_linebreaks			: false,	// remove line break stripping by tinyMCE so that we can read the HTML		
				paste_create_linebreaks 	: true,		// for paste plugin - single linefeeds are converted to hard line break elements
				paste_auto_cleanup_on_paste : true,		// for paste plugin - word paste will be executed when the user copy/paste content
				verify_css_classes 			: false,

				// SETUP EDITOR
				setup : function(ed) {

						// BLUR EVENT	
						ed.on('blur', function(evt) {
							// SAVE COMMAND
							// It will get dirty if the user has made modifications to the contents
							if(ed.isDirty())   
								text_editor.save_command(ed,evt,text_area_component);							
						});// END BLUR EVENT
						/*
						// CHANGE EVENT	
						ed.on('change', function(evt) {
							// SAVE COMMAND
							if(page_globals.modo=='tool_indexation')
								text_editor.save_command(ed,evt,text_area_component);							
						});// END BLUR EVENT
						*/
						
						// CLICK EVENT			
						ed.on('click', function(evt) {
							
							// WRAP : Select current parent wrap
							var obj_warp = $(text_area_component).parents('.wrap_component').first();		//if (DEBUG) console.log( obj_warp )
							component_common.select_wrap(obj_warp)

							// IMG : CLICK ON IMG
							if( evt.target.nodeName == 'IMG' ) {
								// IMAGE COMMAND
								text_editor.image_command(ed,evt,text_area_component)								
							}// END CLICK ON IMG

						});// END CLICK EVENT


						// MOUSEUP EVENT
						ed.on('MouseUp', function(evt) {
							// CREATE_FRAGMENT_COMMAND
							text_editor.create_fragment_command(ed,evt,text_area_component)
						});//END MOUSEUP EVENT


						// KEY UP EVENT
						ed.on('KeyUp', function(evt) {

							switch(context) {
								case 'component_av':
										// Send keys for tool_transcription (F2, ESC)
										if(evt.keyCode==27 || evt.keyCode==113)
										component_text_area.av_editor_key_up(evt);
										break;

								case 'component_image':
										// 114 : Key F3 (114) Write svg tag in text							
										if(evt.keyCode==114)
										text_editor.write_svg_tag(ed,evt,text_area_component);			//if (DEBUG) console.log('->text editor write_svg_tag ed.onKeyUp: '+e.keyCode);
										break;

								case 'component_geolocation':
										// 115 : Key F4 (115) Write geo tag in text
										if(evt.keyCode==115)
										text_editor.write_geo_tag(ed,evt,text_area_component);
										break;
							}	
																		
						});//END KEY UP EVENT

						
				}//end setup

		});
	}

	// WRITE_SVG_TAG
	this.write_svg_tag = function(ed,evt,text_area_component) {
		
		// tool_transcription only 
		if(page_globals.modo!='tool_transcription') return ;

		// Get last tag id
		var last_tag_id = component_text_area.get_last_tag_id(ed,'svg')

		// IMG : Create and insert image in text
		var img_html = component_text_area.build_svg_img(last_tag_id+1,'n');
		ed.selection.setContent( img_html );
	}


	// WRITE_GEO_TAG
	this.write_geo_tag = function(ed,evt,text_area_component) {
		
		// tool_transcription only 
		if(page_globals.modo!='tool_transcription') return ;

		// Get last tag id
		var last_tag_id = component_text_area.get_last_tag_id(ed,'geo');		

		// IMG : Create and insert image in text
		var img_html = component_text_area.build_geo_img(last_tag_id+1,'n');
		ed.selection.setContent( img_html );
	}
	


	// SAVE_COMMAND
	this.save_command = function(ed,evt,text_area_component) {
		
		// REAL TEXT AREA OBJ
		if($(text_area_component).length>0) {

			var text_area_id = $(text_area_component).attr('id');									
			
			// FORCE UPDATE REAL TEXT AREA CONTENT														
			tinyMCE.triggerSave();		//alert(ed.getContent())
			
			// SAVE REAL TEXTAREA CONTENTS
			component_text_area.Save(text_area_component);		if (DEBUG) console.log("-> trigger Save from tinyMCE " + text_area_id);

			// Notify time machine tool content is changed
			top.changed_original_content = 1;	//if (DEBUG) console.log(tool_time_machine.changed_original_content)

			// Update paragraph counter (if function exists)
			if (page_globals.modo=='tool_lang' && typeof tool_lang.writeLeftParagraphsNumber == 'function') {
			  tool_lang.writeLeftParagraphsNumber();
			}
			if (page_globals.modo=='tool_lang' && typeof tool_lang.writeRightParagraphsNumber == 'function') {
			  tool_lang.writeRightParagraphsNumber(); 
			}

			//if (DEBUG) console.log( text_area_component )	
		}else{
			alert("text editor text_area_component not found "+ text_area_id);
		}
	}//end save_command


	// IMAGE_COMMAND
	this.image_command = function(ed,evt,text_area_component) {
		
		// TAG ID : get tag id for verify if index content is changed (revised at save)
		var tag = evt.target.id ;	//alert(tag)

		switch(true) {

			// TC TAG : CONTROL VIDEO PLAYER
			case ( tag.indexOf('[TC_')!=-1 ) :
					// Video goto timecode by tc tag
					component_text_area.goto_time(tag);	//alert(tc)
					break;

			// INDEX TAG : Control de imágenes tags de indexaciones (ACTION ON  CLICK)
			case ( tag.indexOf('index')!=-1 ) :
			
					// Modo changes behavior
					var tipo 			= $(text_area_component).data('tipo'),
						lang 			= $(text_area_component).data('lang'),
						current_parent 	= $(text_area_component).data('parent'),
						id_matrix 		= $(text_area_component).data('id_matrix');	//alert("test editor: "+id_matrix);						

					switch(page_globals.modo) {

						case 'edit' :
									//console.log("context in text_editor:"+context)
									if (context=='list_into_tool_relation' || typeof context=='undefined') {
										// Show button and info about in inspector relations
										component_text_area.load_relation(tag, tipo, id_matrix);	//alert("Show info about in inspector relations - context:"+get_current_url_vars()['context'])	
									}
									else if (context=='list_into_tool_portal') {
										// Show button add fragmento
										component_text_area.load_button_link_fragmet_to_portal(tag, tipo, id_matrix);
											//alert("called load_button_link_fragmet_to_portal in text-editor")
									};														
									break;

						case 'tool_lang' :
									// Show info about in tool lang window
									component_text_area.load_fragment_info(tag, tipo, lang);
									break;

						case 'tool_indexation' :
									// Show info about in tool relation window
									component_text_area.load_fragment_info_in_idexation(tag, tipo, id_matrix);	//alert(tag+' - '+ tipo+' - '+ parent)
									break;
					}
					break;

			// SVG TAG 
			case ( tag.indexOf('[svg-')!=-1 ) :

					var canvas_id = $(text_area_component).data('canvas_id');

					// Load svg editor	
					switch(page_globals.modo) {
		
						case 'tool_transcription' :
							component_image.load_svg_editor(tag);
							break;

						case 'edit' : 
							component_image_read.load_svg_editor_read(tag, canvas_id);

							break;
					}
					break;

			// GEO TAG 
			case ( tag.indexOf('[geo-')!=-1 ) :

					var canvas_id = $(text_area_component).data('canvas_id');

					// Load geo editor	
					switch(page_globals.modo) {
		
						case 'tool_transcription' :
							component_geolocation.load_geo_editor(tag);
							break;

						case 'edit' : 
							component_geolocation_read.load_geo_editor_read(tag, canvas_id);
							break;
					}
					break;

		}//end switch

	}//end image_command 


	// CREATE_FRAGMENT_COMMAND
	this.create_fragment_command = function(ed,evt,text_area_component) {

		// Tool indexation 
		if(page_globals.modo=='tool_indexation') {

			// Btn create fragment
			var btn_create_fragment = $(text_area_component).parent('.content_data').first().children('.btn_create_fragment');

			// Show / hide button create fragment if current_selection.length > 1
			var current_selection = ed.selection.getContent({format : 'text'});

			if (current_selection.length>1) {
				$(btn_create_fragment).fadeIn(100);		//if (DEBUG) console.debug('btn_create_fragment -> fadeIn');
				$('.indexation_page_list').html(current_selection);
			}else{
				$(btn_create_fragment).fadeOut(100);	//if (DEBUG) console.debug('btn_create_fragment -> fadeOut');
				$('.indexation_page_list').html('');
			}
		}
	}

	




};//end text_editor class




