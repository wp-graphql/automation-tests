<?php
/**
 * Plugin Name: Automation Tests
 * Description: A plugin to test automation workflows.
 * Version: 2.2.0
 * Author: Jason Bahl
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/constants.php';

// show a message in the admin dashboard with the plugin name and version
add_action( 'admin_notices', function() {
	echo '<div class="notice notice-info"><p>🏆 Automation Tests v' . AUTOMATION_TESTS_VERSION . '</p></div>';
});



