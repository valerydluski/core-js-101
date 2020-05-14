/* ************************************************************************************************
 *                                                                                                *
 * Plese read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectagle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  this.width = width;
  this.height = height;

  this.getArea = () => this.width * this.height;
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const obj = JSON.parse(json);
  Object.setPrototypeOf(obj, proto);
  return obj;
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurences
 *
 * All types of selectors can be combined using the combinators ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string repsentation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */
const combinators = /\s|\+|~|>/;
const createElement = (selector, value) => `${selector}${value}`;
const creareId = (selector, value) => `${selector}#${value}`;
const creareClass = (selector, value) => `${selector}.${value}`;
const createAttr = (selector, value) => `${selector}[${value}]`;
const createPseudoClass = (selector, value) => `${selector}:${value}`;
const creaetePseudoElement = (selector, value) => `${selector}::${value}`;
const doCombinator = (selector1, combinator, selector2) => `${selector1.stringify()} ${combinator} ${selector2.stringify()}`;
const createError = (helper, value) => {
  if (value.match(/element|id|pseudo-element/) && new RegExp(`${value}`).test(helper)) {
    const err = 'Element, id and pseudo-element should not occur more then one time inside the selector';
    throw new Error(err);
  } else {
    return `${helper}${value}`;
  }
};

const combinatorError = (combinator) => {
  if (!combinators.test(combinator)) {
    const err = 'Combinator parsing error! Only " ", +, ~, > combinators are allowed to use';
    throw new Error(err);
  }
};

const orderError = () => {
  const err = 'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element';
  throw new Error(err);
};

const cssSelectorBuilder = {
  selector: '',
  helper: '',
  order: 0,
  element(value) {
    const obj = Object.create(cssSelectorBuilder);
    obj.helper = createError(this.helper, 'element');
    this.orderCheck(0);
    obj.order = 0;
    obj.selector = createElement(this.selector, value);
    return obj;
  },

  id(value) {
    const obj = Object.create(cssSelectorBuilder);
    obj.helper = createError(this.helper, 'id');
    this.orderCheck(1);
    obj.order = 1;
    obj.selector = creareId(this.selector, value);
    return obj;
  },

  class(value) {
    const obj = Object.create(cssSelectorBuilder);
    obj.helper = createError(this.helper, 'class');
    this.orderCheck(2);
    obj.order = 2;
    obj.selector = creareClass(this.selector, value);
    return obj;
  },

  attr(value) {
    const obj = Object.create(cssSelectorBuilder);
    obj.helper = createError(this.helper, 'attr');
    this.orderCheck(3);
    obj.order = 3;
    obj.selector = createAttr(this.selector, value);
    return obj;
  },

  pseudoClass(value) {
    const obj = Object.create(cssSelectorBuilder);
    obj.helper = createError(this.helper, 'pseudo-class');
    this.orderCheck(4);
    obj.order = 4;
    obj.selector = createPseudoClass(this.selector, value);
    return obj;
  },

  pseudoElement(value) {
    const obj = Object.create(cssSelectorBuilder);
    obj.helper = createError(this.helper, 'pseudo-element');
    this.orderCheck(5);
    obj.order = 5;
    obj.selector = creaetePseudoElement(this.selector, value);
    return obj;
  },

  combine(selector1, combinator, selector2) {
    combinatorError(combinator);
    const obj = Object.create(cssSelectorBuilder);
    obj.selector = doCombinator(selector1, combinator, selector2);
    return obj;
  },

  stringify() {
    return this.selector;
  },

  orderCheck(order) {
    if (order < this.order) {
      orderError();
    }
  },
};

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
