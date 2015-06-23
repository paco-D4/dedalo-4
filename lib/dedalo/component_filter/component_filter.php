<?php
	
	# CONTROLLER
	


	#$id 					= $this->get_id();
	$tipo 					= $this->get_tipo();
	$parent 				= $this->get_parent();
	$section_tipo			= $this->get_section_tipo();
	$modo					= $this->get_modo();
	$dato 					= $this->get_dato();
	$label 					= $this->get_label();
	$required				= $this->get_required();
	$debugger				= $this->get_debugger();
	$visible				= $this->RecordObj_dd->get_visible();
	$permissions			= common::get_permissions($tipo);
	$ejemplo				= NULL;
	$html_title				= "Info about $tipo";
	#$ar_tools_obj			= $this->get_ar_tools_obj();		dump($ar_tools_obj, ' ar_tools_obj');
	$html_tools				= '';	
	#$valor					= $this->get_valor();
	$lang					= $this->get_lang();
	$identificador_unico	= $this->get_identificador_unico();
	$component_name			= get_class($this);
	$dato_string			= $this->get_dato_as_string();

	
	$file_name = $modo;

	switch($modo) {
		
		case 'search' :
				# Nothing to do
				#return print "$component_name. working here..";
				#break;
		case 'ajax' :
		case 'edit' :	
				# Verify component content record is inside section record filter
				#if ($this->get_filter_authorized_record()===false) return NULL ;
				
				$ar_css			= $this->get_ar_css();							
				$ar_proyectos_section = $this->get_ar_proyectos_for_current_section(); 	#dump($ar_proyectos_section,"ar_proyectos_section");
				$id_wrapper 	= 'wrapper_'.$identificador_unico;
				$input_name 	= "{$tipo}_{$parent}";
				$component_info	= $this->get_component_info('json');

				# Cuando se muestra en portales, fijar como no visible en estructura
				if($visible=='no') {
					if (SHOW_DEBUG) {
						$permissions = 1;
						$valor = $this->get_valor();
					}else{
						return null;
					}
				}
				$dato = (array)$dato;
				
				break;

		case 'tool_time_machine' :	
				$ar_css		= $this->get_ar_css();
				$ar_proyectos_section = $this->get_ar_proyectos_for_current_section();
				$id_wrapper = 'wrapper_'.$identificador_unico.'_tm';
				$input_name = "{$tipo}_{$parent}_tm";
				# Force file_name
				$file_name 	= 'edit';
				break;
						
		case 'list_tm' :
				$file_name = 'list';

		case 'list' :	
				#$ar_css		= false;
				#$valor = $this->get_valor();
				$ar_proyectos_section = (array)$this->get_ar_proyectos_for_current_section();
					#dump($dato,"dato");
				break;

		case 'relation' :
				# Force file_name to 'list'
				$file_name 	= 'list';
				$ar_css		= false;
				break;				
							
		case 'lang'	:
				$ar_css = $this->get_ar_css();
				# load only time machime tool
				foreach($ar_tools_obj as $tool_obj) {
					if( get_class($tool_obj) == 'tool_time_machine') {
						$html_tools .= $tool_obj->get_html();
					}
				}
				break;
		case 'print' :
				$valor = $this->get_valor();
				break;
	}
		
	$page_html	= DEDALO_LIB_BASE_PATH .'/'. get_class($this) . '/html/' . get_class($this) . '_' . $file_name . '.phtml';
	if( !include($page_html) ) {
		echo "<div class=\"error\">Invalid mode $this->modo</div>";
	}
?>