<?php
require_once( dirname(dirname(__FILE__)).'/config/config4.php');


if(login::is_logged()!==true) die("<span class='error'> Auth error: please login </span>");

	#dump($_REQUEST);

# set vars
	$vars = array('mode','terminoID');
	if(is_array($vars)) foreach($vars as $name) {
		$$name = common::setVar($name);
	}

# mode
if(empty($mode)) exit("<span class='error'> Trigger: Error Need mode..</span>");



/**
* SHOW_INDEXATIONS 
*/
if($mode=='show_indexations') {

	# DATA VERIFY
	if(empty($terminoID) || strlen($terminoID)<3) exit("Trigger Error: terminoID is mandatory");
	

	# DIFFUSION_INDEX_TS
	$diffusion_index_ts = new diffusion_index_ts($terminoID);
	$html 				= $diffusion_index_ts->get_html();
		#dump($html,'$html');

	exit($html);

}#end Save






?>