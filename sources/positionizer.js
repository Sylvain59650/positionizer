var Positionizer = function() {}

const __internal = {
  getAllStyles: function(element) { return window.getComputedStyle(element); },

  getStyle: function(element, prop) { return __internal.getAllStyles(element)[prop]; },

  isStaticPositioned: function(element) {
    return (__internal.getStyle(element, "position") || "static") === "static";
  },

  offsetParent: function(element) {
    let offsetParentEl = element.offsetParent || document.documentElement;
    while (offsetParentEl && offsetParentEl !== document.documentElement && __internal.isStaticPositioned(offsetParentEl)) {
      offsetParentEl = offsetParentEl.offsetParent;
    }
    return offsetParentEl || document.documentElement;
  },

  getOffset: function(element) {
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
}


Positionizer.setPosition = function(element, position) {
  element.style.left = position.left + "px";
  element.style.top = position.top + "px";
  element.style.position = "absolute";
}

Positionizer.getPosition = function(element) {
  let elPosition = null;
  let parentOffset = { width: 0, height: 0, top: 0, bottom: 0, left: 0, right: 0 };
  if (__internal.getStyle(element, "position") === "fixed") {
    elPosition = element.getBoundingClientRect();
  } else {
    const offsetParentEl = __internal.offsetParent(element);
    elPosition = __internal.getOffset(element);
    if (offsetParentEl !== document.documentElement) {
      parentOffset = __internal.getOffset(offsetParentEl);
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


Positionizer.setRelativePosition = function(fixedEl, floatingEl, placement, appendToBody, distX, distY) {
  Positionizer.setPosition(floatingEl, Positionizer.getRelativePosition(fixedEl, floatingEl, placement, appendToBody, distX, distY));
}

Positionizer.ATTACH_DEFAULT_SPACINGS = {
  s: { dx: 2, dy: 2 },
  t: { dx: 2, dy: 2 }
};

Positionizer.getAttach = function(el, options) {
  if (arguments.length !== 2) {
    throw TypeError("arguments needed");
  }
  const bcr = el.getBoundingClientRect();
  var dX = 0;
  var dY = 0;
  if (options && options.dist) {
    dX = options.dist.x || 0;
    dY = options.dist.y || 0;
  }
  const x = bcr.left + dX;
  const y = bcr.top + dY;
  const w = bcr.width;
  const h = bcr.height;

  switch (options.place) {
    case "left-top":
    case "top-left":
      return { left: x, top: y }
    case "left":
      return { left: x, top: y + h / 2 }
    case "left-bottom":
    case "bottom-left":
      return { left: x, top: y + h }
    case "bottom":
      return { left: x + w / 2, top: y + h }
    case "right-bottom":
    case "bottom-right":
      return { left: x + w, top: y + h }
    case "right":
      return { left: x + w, top: y + h / 2 }
    case "right-top":
    case "top-right":
      return { left: x + w, top: y }
    case "top":
      return { left: x + w / 2, top: y }
    case "center":
      return { left: x + w / 2, top: y + h / 2 }
  }
  throw TypeError("unkown place " + options.place);
}

/* eslint-disable */
Positionizer.getRelativePosition = function(fixedEl, floatingEl, placement, appendToBody, distX, distY) {
  const fixedElPos = appendToBody ? __internal.getOffset(fixedEl, false) : Positionizer.getPosition(fixedEl, false);
  const floatingElStyles = __internal.getAllStyles(floatingEl);
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