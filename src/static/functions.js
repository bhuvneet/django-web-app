/* File:    function.js
By:         Bhuvneet Thakur
Date:       April 7, 2023
Description: This file contains the functionality for generating alerts */

/* Function: handleAlerts
 Parameters: type, msg
 Description:  This function is used to generate alerts
 Return: None */
const handleAlerts = (type, msg) => {
    alertBox.innerHTML = `
        <div class="alert alert-${type}" role="alert">
            ${msg}
        </div>
    `
}