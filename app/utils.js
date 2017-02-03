import _ from 'lodash';
import $ from 'jquery';
import { remote } from 'electron';

let dialog;
if (remote) { //Hack for testing
  dialog = remote.dialog;
}

export function distanceBetweenPoints(p1, p2) {
  return Math.abs(Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)));
}

export function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
         s4() + '-' + s4() + s4() + s4();
}

export class Rect {
  constructor(el) {
    if (el) {
      this.fromElement(el);
    }
  }

  computeDerivedProperties() {
    this.middleX = this.x + (this.w / 2);
    this.middleY = this.y + (this.h / 2);
  }

  fromElement(el) {
    if (!(el instanceof $)) {
      el = $(el);
    }

    const height = el.height();
    const width = el.width();
    const offset = el.offset();

    this.x = offset.left;
    this.y = offset.top;
    this.w = width;
    this.h = height;

    this._el = el;

    this.computeDerivedProperties();
    return this;
  }
}
export function getGlobalPosFromSyntheticEvent(e) {
  return { x: e.clientX, y: e.clientY };
}

export function minDistanceBetweenPointAndLine(p, line) {
  /* From http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment */
  const { x, y } = p;
  const x1 = line[0].x;
  const y1 = line[0].y;
  const x2 = line[1].x;
  const y2 = line[1].y;

  /* TD: Why does this work? */
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = (A * C) + (B * D);
  const lenSq = (C * C) + (D * D);
  let param = -1;

  // in case of 0 length line
  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + (param * C);
    yy = y1 + (param * D);
  }

  const dx = x - xx;
  const dy = y - yy;
  return Math.sqrt((dx * dx) + (dy * dy));
}

export function wasRightButtonPressed(e) {
  let isRightMB;

  if ('which' in e) { // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
    isRightMB = e.which === 3;
  } else if ('button' in e) { // IE, Opera
    isRightMB = e.button === 2;
  }

  return isRightMB;
}


class GlobalEventManager {
  // Lower priority fires first
  // Event listeners are passed (browserEvent, cancel)
  // Cancel acts like prevent default
  constructor() {
    this.events = {};
  }

  addListener(eventName, listener, priority) {
    if (!this.events[eventName]) {
      window.addEventListener(eventName, (e) => {
        let isCanceled = false;
        let cancel = () => { isCanceled = true; };

        let eventArr = this.events[eventName];
        for (let i = 0; i < eventArr.length; i++) {
          if (!isCanceled) {
            eventArr[i].listener(e, cancel);
          }
        }
      });

      this.events[eventName] = [];
    }

    const id = guid();

    this.events[eventName].push({ listener, priority, id });
    this.events[eventName] = _.sortBy(this.events[eventName], (ev) => { ev.priority; });

    return id
  }

  removeListener(eventName, id) {
    return _.remove(this.events[eventName], (listener) => {
      return listener.id === id;
    }).length > 0;
  }
}

export const globalEventManager = new GlobalEventManager();

export function saveSiteDialog(actions) {
  dialog.showSaveDialog({
    title: 'Save Site',
    filters: [
      {
        name: 'motif file',
        extensions: ['json']
      }
    ]
  }, (filename) => {
    actions.saveSite(filename);
  });
}

export function saveSiteAsDialog(actions) {
  dialog.showSaveDialog({
    title: 'Save Site As',
    filters: [
      {
        name: 'motif file',
        extensions: ['json']
      }
    ]
  }, (filename) => {
    actions.saveSite(filename);
  });
}

export function loadSiteDialog(actions) {
  dialog.showOpenDialog({
    title: 'Select a site to edit',
    properties: ['openFile'],
    filters: [
      {
        name: 'motif file',
        extensions: ['json']
      }
    ]
  }, (filenames) => {
    if (!filenames) return;
    actions.loadSite(filenames[0]);
  });
}
