<?php
	
	# CONTROLLER

	$tipo 					= $this->get_tipo();
	$target_tipo			= $this->get_target();
	$id						= NULL;
	$modo					= 'edit';		
	$label 					= $this->get_label();
	$debugger				= $this->get_debugger();
	$permissions			= common::get_permissions($tipo); 	
	$html_title				= "Info about $tipo";
		
	
	switch($modo) {
		
		case 'edit'	:	$ar_css		= $this->get_ar_css();	
						break;
						
		case 'list'	:	$ar_css		= false;
						break;	
						
	}
		
	$page_html	= 'html/' . get_class($this) . '_' . $modo . '.phtml';		
	include($page_html);
?>