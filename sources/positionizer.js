/**
 * @license
 * positionizer  0.9.0
 * Copyright Sylvain Longepee
 * Released under MIT license
 */

;
(function(moduleName, root, factory) {
  if (typeof define === 'function' && define.amd) {} else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    window.Positionizer = factory();
  }
}("PositionizerModule", this, function() {
  'use strict';

  var Positionizer = function() {}

  var getAllStyles = function(element) { return window.getComputedStyle(element); }

  var getStyle = function(element, prop) { return getAllStyles(element)[prop]; }

  var isStaticPositioned = function(element) {
    return (getStyle(element, "position") || "static") === "static";
  }

  var offsetParent = function(element) {
    let offsetParentEl = element.offsetParent || document.documentElement;
    while (offsetParentEl && offsetParentEl !== document.documentElement && isStaticPositioned(offsetParentEl)) {
      offsetParentEl = offsetParentEl.offsetParent;
    }
    return offsetParentEl || document.documentElement;
  }

  Positionizer.setPosition = function(element, position) {
    element.style.left = position.left + "px";
    element.style.top = position.top + "px";
    element.style.position = "absolute";
  }

  Positionizer.getPosition = function(element) {
    let elPosition;
    let parentOffset = { width: 0, height: 0, top: 0, bottom: 0, left: 0, right: 0 };
    if (getStyle(element, "position") === "fixed") {
      elPosition = element.getBoundingClientRect();
    } else {
      const offsetParentEl = offsetParent(element);
      elPosition = getOffset(element);
      if (offsetParentEl !== document.documentElement) {
        parentOffset = getOffset(offsetParentEl);
      }
      parentOffset.top += offsetParentEl.clientTop;
      parentOffset.left += offsetParentEl.clientLeft;
    }
    elPosition.top -= parentOffset.top;
    elPosition.bottom -= parentOffset.top;
    elPosition.left -= parentOffset.left;
    elPosition.right -= parentOffset.left;
    return elPosition;
  }

  var getOffset = function(element) {
    const elBcr = element.getBoundingClientRect();
    const viewportOffset = {
      top: window.pageYOffset - document.documentElement.clientTop,
      left: window.pageXOffset - document.documentElement.clientLeft
    };

    let elOffset = {
      height: elBcr.height || element.offsetHeight,
      width: elBcr.width || element.offsetWidth,
      top: elBcr.top + viewportOffset.top,
      bottom: elBcr.bottom + viewportOffset.top,
      left: elBcr.left + viewportOffset.left,
      right: elBcr.right + viewportOffset.left
    };

    return elOffset;
  }

  Positionizer.setRelativePosition = function(fixedEl, floatingEl, placement, appendToBody, distX, distY) {
    Positionizer.setPosition(floatingEl, Positionizer.getRelativePosition(fixedEl, floatingEl, placement, appendToBody, distX, distY));
  }

  Positionizer.getRelativePosition = function(fixedEl, floatingEl, placement, appendToBody, distX, distY) {
    const fixedElPos = appendToBody ? Positionizer.getOffset(fixedEl, false) : Positionizer.getPosition(fixedEl, false);
    const floatingElStyles = getAllStyles(floatingEl);
    const bcr = floatingEl.getBoundingClientRect();
    var sp = placement.split("-");
    const placementPrimary = sp[0] || "top";
    const outside = (sp.length === 3) ? "-outside" : "";
    const placementSecondary = ((sp[1] || "") + outside) || "center";
    distX = distX || 10;
    distY = distY || 10;
    let floatingElPos = {
      "height": bcr.height || floatingEl.offsetHeight,
      "width": bcr.width || floatingEl.offsetWidth,
      "top": 0,
      "bottom": bcr.height || floatingEl.offsetHeight,
      "left": 0,
      "right": bcr.width || floatingEl.offsetWidth
    };

    switch (placementPrimary) {
      case "top":
        floatingElPos.top =
          fixedElPos.top - (floatingEl.offsetHeight + parseFloat(floatingElStyles.marginBottom)) - distY;
        break;
      case "bottom":
        floatingElPos.top = fixedElPos.top + fixedElPos.height + distY;
        break;
      case "left":
        floatingElPos.left =
          fixedElPos.left - (floatingEl.offsetWidth + parseFloat(floatingElStyles.marginRight)) - distX;
        break;
      case "right":
        floatingElPos.left = fixedElPos.left + fixedElPos.width + distX;
        break;
    }

    switch (placementSecondary) {
      case "top":
        floatingElPos.top = fixedElPos.top;
        break;
      case "bottom":
        floatingElPos.top = fixedElPos.top + fixedElPos.height - floatingEl.offsetHeight;
        break;
      case "left":
        floatingElPos.left = fixedElPos.left;
        break;
      case "left-outside":
        floatingElPos.left = fixedElPos.left - floatingEl.offsetWidth - distX;
        break;
      case "right":
        floatingElPos.left = fixedElPos.left + fixedElPos.width - floatingEl.offsetWidth;
        break;
      case "right-outside":
        floatingElPos.left = fixedElPos.left + fixedElPos.width + distX;
        break;
      case "center":
        if (placementPrimary === "top" || placementPrimary === "bottom") {
          floatingElPos.left = fixedElPos.left + fixedElPos.width / 2 - floatingEl.offsetWidth / 2;
        } else {
          floatingElPos.top = fixedElPos.top + fixedElPos.height / 2 - floatingEl.offsetHeight / 2;
        }
        break;
    }
    switch (placement) {
      case "bottom-right-inside":
        floatingElPos.top = fixedElPos.top + fixedElPos.height - floatingEl.offsetHeight - distY;
        floatingElPos.left = fixedElPos.left + fixedElPos.width - floatingEl.offsetWidth - distX;
        break;
      case "bottom-left-inside":
        floatingElPos.top = fixedElPos.top + fixedElPos.height - floatingEl.offsetHeight - distY;
        floatingElPos.left = fixedElPos.left + distX;
        break;
      case "bottom-inside":
        floatingElPos.top = fixedElPos.top + fixedElPos.height - floatingEl.offsetHeight - distY;
        floatingElPos.left = fixedElPos.left + fixedElPos.width / 2 - floatingEl.offsetWidth / 2;
        break;

      case "top-right-inside":
        floatingElPos.top = fixedElPos.top + distY;
        floatingElPos.left = fixedElPos.left + fixedElPos.width - floatingEl.offsetWidth - distX;
        break;
      case "top-left-inside":
        floatingElPos.top = fixedElPos.top + distY;
        floatingElPos.left = fixedElPos.left + distX;
        break;
      case "top-inside":
        floatingElPos.top = fixedElPos.top + distY;
        floatingElPos.left = fixedElPos.left + fixedElPos.width / 2 - floatingEl.offsetWidth / 2;
        break;
      case "left-inside":
        floatingElPos.top = fixedElPos.top + fixedElPos.height / 2 - floatingEl.offsetHeight / 2;
        floatingElPos.left = fixedElPos.left + distX;
        break;
      case "right-inside":
        floatingElPos.top = fixedElPos.top + fixedElPos.height / 2 - floatingEl.offsetHeight / 2;
        floatingElPos.left = fixedElPos.left + fixedElPos.width - floatingEl.offsetWidth - distX;
        break;
      case "center":
        floatingElPos.top = fixedElPos.top + fixedElPos.height / 2 - floatingEl.offsetHeight / 2;
        floatingElPos.left = fixedElPos.left + fixedElPos.width / 2 - floatingEl.offsetWidth / 2;
        break;
    }

    return floatingElPos;
  }

  return Positionizer;
}));