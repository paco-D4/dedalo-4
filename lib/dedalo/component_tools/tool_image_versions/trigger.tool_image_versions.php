<?php
require_once( dirname(dirname(dirname(__FILE__))) .'/config/config4.php');
require_once( DEDALO_LIB_BASE_PATH . '/media_engine/class.ImageObj.php');


if(login::is_logged()!==true) die("<span class='error'> Auth error: please login </span>");


# set vars
	$vars = array('mode','image_id','quality','aditional_path','source_quality','target_quality','tipo','parent','id_matrix','degrees','extension');
	if(is_array($vars)) foreach($vars as $name) {
		$$name = common::setVar($name);
	}

# mode
	if(empty($mode)) exit("<span class='error'> Trigger: Error Need mode..</span>");



if($mode=='convert_simple') {
	$vars = array('source_file','target_file');
	foreach($vars as $name) $$name = common::setVar($name);
	
	$res = ImageMagick::convert($source_file, $target_file, $flags='');
		#dump($res,'res Error error');

	die($res);
}


/**
* GENERATE VERSION
* Build a minor quality version of current file (from 404 to 'audio' for example)
* @param $source_quality
* @param $target_quality
* @param $image_id
*/
if($mode=='generate_version') {

	if (empty($source_quality)) {
		return "Error: source_quality is not defined!";
	}
	if (empty($target_quality)) {
		return "Error: target_quality is not defined!";
	}
	if (empty($image_id) || strlen($image_id)<1) {
		return "Error: image_id is not defined!";
	}
	if ( empty($parent) ) {
		throw new Exception("Error Processing Request. Few vars! (parent)", 1);
	}
	if ( empty($id_matrix)  ) {
		throw new Exception("Error Processing Request. Few vars! (id_matrix)", 1);
	}
	

	# Image source
	$ImageObj				= new ImageObj($image_id, $source_quality, $aditional_path);
	$source_image 			= $ImageObj->get_local_full_path();
	$source_pixels_width	= $ImageObj->get_image_width();
	$source_pixels_height	= $ImageObj->get_image_height();
		#dump($source_image,"$source_pixels_width x $source_pixels_height - aditional_path:$aditional_path");

	# Image target
	$ImageObj				= new ImageObj($image_id, $target_quality, $aditional_path);
	$target_image 			= $ImageObj->get_local_full_path();
	$ar_target 				= ImageObj::get_target_pixels_to_quality_conversion($source_pixels_width, $source_pixels_height, $target_quality);
	$target_pixels_width 	= $ar_target[0];
	$target_pixels_height 	= $ar_target[1];
		#dump($ar_target,"$target_pixels_width x $target_pixels_height - source_quality:$source_quality - target_quality:$target_quality ($source_pixels_width x $source_pixels_height)");#die();

	# TARGET FOLDER VERIFY (EXISTS AND PERMISSIONS)
	try{
		$target_folder_path = $ImageObj->get_media_path_abs() ;
			#dump($target_folder_path,'target_folder_path');die();
		# folder exists
		if( !is_dir($target_folder_path) ) {
		$create_dir 	= mkdir($target_folder_path, 0777,true);
		if(!$create_dir) throw new Exception(" Error on read or create directory \"$target_quality\". Permission denied $target_folder_path (2)");
		}
		
		# folder set permissions
		$wantedPerms 	= 0777;
		$actualPerms 	= fileperms($target_folder_path);
		if($actualPerms < $wantedPerms) {
			$ch_mod = chmod($target_folder_path, $wantedPerms);
			if(!$ch_mod) throw new Exception(" Error on set permissions of directory \"$target_quality\".");
		}				
	} catch (Exception $e) {
		$msg = '<span class="error">'.$e->getMessage().'</span>';
		echo Error::wrap_error($msg);
	}
	
	if ($target_quality==DEDALO_IMAGE_THUMB_DEFAULT) {
		# Thumb
		$r = ImageMagick::dd_thumb('list', $source_image, $target_image);	# , $dimensions="102x57"
		error_log($r);
		$response=1;

	}else{
		# Thumb
		$Thumb = new Thumb($source_image);
		$Thumb->resize_basic($target_pixels_width,$target_pixels_height);	
		$response = $Thumb->save($target_image, $quality = 100);
	}
	
	

	/*	DESACTIVO TEMPORALMENTE
	* Con la introducción de la posibilidad de nombrar el fichero, el tipo no puede ser obtenido del nombre Por ello, revisar esta parte para poder generar un log consistente
	*
	# Extract tipo from image_id like dd732-1.mp4 => dd732
	$ar 	= explode('-', $image_id);
	$tipo 	= $ar[0];

	$top_tipo 	= $_SESSION['config4']['top_tipo'];
	$top_id 	= $_SESSION['config4']['top_id'];
	
	# LOGGER ACTIVITY : QUE(action normalized like 'LOAD EDIT'), LOG LEVEL(default 'logger::INFO'), TIPO(like 'dd120'), DATOS(array of related info)
	logger::$obj['activity']->log_message(
		'NEW VERSION',
		logger::INFO,
		$tipo,
		NULL,
		array(	"msg"				=> "Generated image file",
				"id" 				=> $id_matrix,
				"tipo"				=> $tipo,
				"parent"			=> $parent,
				"top_id"			=> $top_id,
				"top_tipo"			=> $top_tipo,				
				"image_id" 			=> $image_id,
				"source_quality" 	=> $source_quality,
				"target_quality" 	=> $target_quality
			)
	);
	*/
	if($response==1) {
		$html = "Created file";
	}else{
		$html = $response;	
	}
	

	print $html;
	die();
}#and generate_version


/**
* ROTATE IMAGE
* Rotate Xº current image 
* @param $degrees
* @param $image_id
* @param $quality
*/
if($mode=='rotate_image') {
	
	if (empty($degrees)) {
		return "Error: degrees is not defined!";
	}
	if (empty($image_id) || strlen($image_id)<1) {
		return "Error: image_id is not defined!";
	}
	if (empty($quality)) {
		return "Error: quality is not defined!";
	}
	if ( empty($parent) ) {
		throw new Exception("Error Processing Request. Few vars! (parent)", 1);
	}
	if ( empty($id_matrix)  ) {
		throw new Exception("Error Processing Request. Few vars! (id_matrix)", 1);
	}
	


	# Image source
	$ImageObj			= new ImageObj($image_id, $quality, $aditional_path);
	$source_image 		= $ImageObj->get_local_full_path();
	$target_image 		= $source_image ;
		#dump($target_image,'$target_image'); die();
	
	# Thumb
	$Thumb = new Thumb($source_image);
	$Thumb->rotate($degrees);	
	$response = $Thumb->save($target_image, 100);
	

	/*	DESACTIVO TEMPORALMENTE
	* Con la introducción de la posibilidad de nombrar el fichero, el tipo no puede ser obtenido del nombre Por ello, revisar esta parte para poder generar un log consistente
	*	
	# Extract tipo from image_id like dd732-1.mp4 => dd732
	$ar 	= explode('-', $image_id);
	$tipo 	= $ar[0];

	$top_tipo 	= $_SESSION['config4']['top_tipo'];
	$top_id 	= $_SESSION['config4']['top_id'];
	
	# LOGGER ACTIVITY : QUE(action normalized like 'LOAD EDIT'), LOG LEVEL(default 'logger::INFO'), TIPO(like 'dd120'), DATOS(array of related info)
	logger::$obj['activity']->log_message(
		'NEW',
		logger::INFO,
		$tipo,
		NULL,
		array(	"msg"				=> "Rotated image file",
				"id" 				=> $id_matrix,
				"tipo"				=> $tipo,
				"parent"			=> $parent,
				"top_id"			=> $top_id,
				"top_tipo"			=> $top_tipo,				
				"image_id" 			=> $image_id,
				"quality" 			=> $quality,
				"degrees" 			=> $degrees
			)
	);
	*/
	
	if($response==1) {
		$html = "Rotated file";
	}else{
		$html = $response;	
	}	

	print $html;
	die();
}#and generate_version


/**
* DELETE VERSION
*/
if($mode=='delete_version') {
	
	if (empty($image_id) || strlen($image_id)<1) {
		return "Error: image_id is not defined!";
	}
	if (empty($quality)) {
		return "Error: quality is not defined!";
	}
	if ( empty($parent) ) {
		throw new Exception("Error Processing Request. Few vars! (parent)", 1);
	}
	if ( empty($id_matrix) ) {
		throw new Exception("Error Processing Request. Few vars! (id_matrix)", 1);
	}
	
	$ImageObj 			= new ImageObj($image_id, $quality, $aditional_path);		
	$folder_path		= $ImageObj->get_media_path_abs(); # incluye / final
	$folder_path_del	= $folder_path . "deleted/";
	$file				= $folder_path . $image_id . '.' . $ImageObj->get_extension();
	
	if(file_exists($file)) {
		
		try{
			
			# delete folder exists ?	
			if( !is_dir($folder_path_del) ) {
			$create_dir 	= mkdir($folder_path_del, 0777,true);
			if(!$create_dir) throw new Exception(" Error on read or create directory \"deleted\". Permission denied . The files are not deleted") ;
			}
			
			# delete folder set permissions
			$wantedPerms 	= 0777;
			$actualPerms 	= fileperms($folder_path_del);
			if($actualPerms < $wantedPerms) chmod($folder_path_del, $wantedPerms);
			
			# move / rename file
			$rename 		= rename($file, $folder_path_del . "/$image_id" . '_deleted_' . date("Y-m-d") . '.' . $ImageObj->get_extension() );
			if(!$rename) 	throw new Exception(" Error on move files to folder \"deleted\" . Permission denied . The files are not deleted");	
			

			/*	DESACTIVO TEMPORALMENTE
			* Con la introducción de la posibilidad de nombrar el fichero, el tipo no puede ser obtenido del nombre Por ello, revisar esta parte para poder generar un log consistente
			*
			# Extract tipo from image_id like dd732-1.mp4 => dd732
			$ar 	= explode('-', $image_id);
			$tipo 	= $ar[0];

			$top_tipo 	= $_SESSION['config4']['top_tipo'];
			$top_id 	= $_SESSION['config4']['top_id'];
			
			# LOGGER ACTIVITY : QUE(action normalized like 'LOAD EDIT'), LOG LEVEL(default 'logger::INFO'), TIPO(like 'dd120'), DATOS(array of related info)
			logger::$obj['activity']->log_message(
				'DELETE FILE',
				logger::INFO,
				$tipo,
				NULL,
				array(	"msg"				=> "Deleted image file (file is renamed and moved to delete folder)",
						"id" 				=> $id_matrix,
						"tipo"				=> $tipo,
						"parent"			=> $parent,
						"top_id"			=> $top_id,
						"top_tipo"			=> $top_tipo,
						"image_id" 			=> $image_id,
						"quality" 			=> $quality
					)
			);
			*/
			
			echo "File ". $image_id . '.' . $ImageObj->get_extension() . " deleted ! "  ;
			
		} catch (Exception $e) {
			echo 'Exception: ',  $e->getMessage(), "\n";
		}
	}		
	exit();	
}#end delete


/**
* GET THUMB
* @param $tipo, $id_matrix
*/
if($mode=='get_thumb') {
	
	if (empty($tipo) || strlen($tipo)<3) {
		return "Error: tipo is not defined!";
	}
	if (empty($id_matrix)) {
		return "Error: id_matrix is not defined!";
	}

	# Create new component_image to build standar thumb
	$component_image = new component_image($id_matrix,$tipo);

	# THUMB (PLAYER)
	$component_image->set_modo('thumb');
	$thumb_html = $this->component_obj->get_html();
	print $thumb_html;
	exit();

}#end delete


/**
* FILE EXISTS
* Test if file exist (used to test when proccess version it finish -called every 5 seconds-)
* @param $image_id, $quality
*/
if($mode=='file_exists') {
	
	dump($aditional_path,'$aditional_path');
	
	if ( empty($image_id) ) {
		throw new Exception("Error Processing Request. Few vars! (image_id)", 1);
	}
	if ( empty($quality) ) {
		throw new Exception("Error Processing Request. Few vars! (quality)", 1);
	}
	$file_size = 0;

	# ImageOBJ
	$ImageObj 	= new ImageObj($image_id, $quality, $aditional_path);
	$file_name	= $ImageObj->get_local_full_path();

	if(file_exists($file_name)) {

		try {	
			$size		= @filesize($file_name) ;
			if(!$size)	throw new Exception('Unknow size!') ;

			$size_kb		= round($size / 1024) ;
		
			if($size_kb <= 1024) {
				$file_size 	= $size_kb . ' KB' ;
			}else{
				$file_size 	= round($size_kb / 1024) . ' MB' ;
			}
		} catch (Exception $e) {
			if(SHOW_DEBUG)
			echo '',  $e->getMessage(), "\n";
			#trigger_error( __METHOD__ . " " . $e->getMessage() , E_USER_NOTICE) ;			
		}			
	}
	#dump($file_name, "file_size $file_size");
	print $file_size;
	exit();
}#end file exists


/**
* DOWNLOAD FILE
* @param $image_id, $quality
*/
if($mode=='download_file') {	

	if (empty($image_id) || strlen($image_id)<1) {
		die("Error Processing Request. Few vars! (image_id)");
	}
	if (empty($quality)) {
		die("Error Processing Request. Few vars! (quality)");
	}
	if ( empty($parent) ) {
		throw new Exception("Error Processing Request. Few vars! (parent)", 1);
	}
	if ( empty($id_matrix) ) {
		throw new Exception("Error Processing Request. Few vars! (id_matrix)", 1);
	}

	# ImageOBJ
	$ImageObj = new ImageObj($image_id, $quality, $aditional_path);

	# LIB DOWNLOAD PREPARE
	# VARS FOR LIB 'donwload.php'
	$base_dir			= $ImageObj->get_media_path_abs();	 #$ImageObj->get_media_path(); 	
	$allowed_referrer	= DEDALO_HOST;
	
	# If var 'extension' is received, overwrite default
	if(!$extension)
	$extension 			= $ImageObj->get_extension();
	
	$file_name			= $ImageObj->get_name() . '.' . $extension;
	$file_name_showed	= 'media_downloaded_' . $file_name ;

	# Extract tipo from image_id like dd732-1.mp4 => dd732
	$ar 	= explode('-', $image_id);
	$tipo 	= $ar[0];

	$top_id 		= $_SESSION['config4']['top_id'];
	$top_tipo 		= $_SESSION['config4']['top_tipo'];

	# LOGGER ACTIVITY : QUE(action normalized like 'LOAD EDIT'), LOG LEVEL(default 'logger::INFO'), TIPO(like 'dd120'), DATOS(array of related info)
	logger::$obj['activity']->log_message(
		'DOWNLOAD',
		logger::INFO,
		$tipo,
		NULL,
		array(	"msg"				=> "Downloaded image file",
				"id" 				=> $id_matrix,
				"tipo"				=> $tipo,
				"parent"			=> $parent,
				"top_id"			=> $top_id,
				"top_tipo"			=> $top_tipo,
				"image_id" 			=> $image_id,
				"quality" 			=> $quality
			)
	);

	# unlock session allows continue brosing
	session_write_close();

	# LOAD LIB 
	$page = DEDALO_LIB_BASE_PATH . '/media_engine/lib/download.php';
	require_once($page);

	exit();
}#end download



?>