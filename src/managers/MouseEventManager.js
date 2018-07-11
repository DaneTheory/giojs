/**
 * @author syt123450 / https://github.com/syt123450
 */

import { CountryColorMap } from "../countryInfo/CountryColorMap.js";
import { Utils } from "../utils/Utils.js";

/**
 * This Manager manage all mouse event for the scene.
 * This Manager will be created when InitHandler's init() function is called.
 */

function SceneEventManager () {

    var mouseX = 0, mouseY = 0, pmouseX = 0, pmouseY = 0;
    var pressX = 0, pressY = 0;

    var controller;

    // the mouse and raycaster is used to judge whether the mouse is clicked on the globe

    var mouse = new THREE.Vector2();
    var raycaster = new THREE.Raycaster();

    function onTouchStart ( event ) {

		mouseX = event.touches[0].clientX - controller.container.width * 0.5;
		mouseY = event.touches[0].clientY - controller.container.height * 0.5;

		mouse.x = ( event.touches[0].clientX / controller.container.width ) * 2 - 1;
		mouse.y = -( event.touches[0].clientY / controller.container.height ) * 2 + 1;

		raycaster.setFromCamera( mouse, controller.camera );

		var intersects = raycaster.intersectObjects( controller.scene.children, true );

		// intersects.length === 0 means that the mouse click is not on the globe

		if ( intersects.length === 0 ) {

			return;

		}

		// to get the color of clicked area on the globe's surface

		var pickColorIndex = controller.surfaceHandler.getPickColor( mouseX, mouseY );

		// for debug

		// console.log( pickColorIndex );

		/**
		 * on a specific condition will let the SwitchCountryHandler to execute switch
		 * condition:
		 * 1. the picked color is actually a color to represent a country
		 * 2. the picked color is not 0 (0 represents ocean)
		 * 3. if the user want only the mentioned countries can be clicked, it will judge whether the picked country is mentioned
		 */

		if ( CountryColorMap[ pickColorIndex ] !== undefined &&
			pickColorIndex !== 0 &&
			( ( controller.configure.control.disableUnmentioned &&
				controller.mentionedCountryCodes.indexOf( pickColorIndex ) !== -1 ) ||
				!controller.configure.control.disableUnmentioned ) ) {

			controller.switchCountryHandler.executeSwitch( pickColorIndex )

		}

		if ( event.target.className.indexOf( 'noMapDrag' ) !== -1 ) {

			return;

		}

		// set the state to the dragging state

		controller.rotationHandler.setDragging( true );
		pressX = mouseX;
		pressY = mouseY;
		controller.rotationHandler.clearRotateTargetX();

    }

    function onTouchEnd ( event ) {

		// When touch up, the notify the RotatingHandler to set drag false

		controller.rotationHandler.setDragging( false );

    }

    function onTouchMove ( event ) {

		pmouseX = mouseX;
		pmouseY = mouseY;

		// get clientX and clientY from "event.touches[0]", different with onmousemove event

		mouseX = event.touches[0].clientX - controller.container.width * 0.5;
		mouseY = event.touches[0].clientY - controller.container.height * 0.5;

		// if it is in a dragging state, let the RotationHandler to handlers the rotation of the globe

		if ( controller.rotationHandler.isDragging() ) {

			controller.rotationHandler.addRotateVY( ( mouseX - pmouseX ) / 2 * Math.PI / 180 * 0.3 );
			controller.rotationHandler.addRotateVX( ( mouseY - pmouseY ) / 2 * Math.PI / 180 * 0.3 );

		}

    }

    /**
     * bind all event handlers to the dom of the scene, the resize event will be bind to window.
     * This function will be called when InitHandler's init() function be called
     */

    function bindEvent ( controllerPara ) {

    	controller = controllerPara;

		wx.onTouchStart(onTouchStart);
		wx.onTouchEnd(onTouchEnd);
		wx.onTouchMove(onTouchMove);

    }

    return {

        bindEvent: bindEvent

    }

}

export { SceneEventManager }