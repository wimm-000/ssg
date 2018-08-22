/**
 * Objeto para la validation de los diferentes elementos;
 */
const validation = {
  /**
   * Validación de email
   */
  email: (email) => {
    const tester = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-?\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
    if (!email) {
      return false;
    }
    if (email.length > 254) {
      return false;
    }
    const valid = tester.test(email);
    if (!valid) {

      return false;
    }
    // Un poco más asegurandonos cosas que regex no gestiona.
    const parts = email.split('@');
    if (parts[0].length > 64) {
      return false;
    }
    const domainParts = parts[1].split('.');
    if (domainParts.some((part) => { return part.length > 63; })) {
      return false;
    }
    return true;
  },
  /**
   * Validación de cadena vacia
   */
  is_empty: (string) => {
    return (string.length === 0 || !string.trim());
  },
  /**
   * Validación de un mínimo de caracteres.
   * @param {*} string
   * @param {*} limit
   */
  minLength(string, limit = 5) {
    if (string.length < limit) {
      return false;
    }
    return true;
  },
  /**
   * Validación de un máximo de caracteres.
   */
  maxLength: (string, limit = 5) => {
    if (string.length > limit) {
      return false;
    }
    return true;
  },
  /**
   * Compara dos cadenas para ver si son iguales.
   */
  equals: (str1, str2) => {
    if (str1 !== str2) {
      return false;
    }
    return true;
  },

  is_checked: (element_id) => {
    var isChecked= document.getElementById(element_id).checked;
    if(isChecked){ //checked
      return true;
    }else{ //unchecked
      return false;
    }
  },
  /**
   * Comprobamos si es un número.
   */
  isNumber: (val) => {
    if (isNaN(val)) {
      return false;
    }
    return true;
  },
  validDate: (date) => {
    var matches = /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/.exec(date);
    if (matches == null) return false;
    var m = matches[2] - 1;
    var d = matches[1];
    var y = matches[3];
    var composedDate = new Date(y, m, d);
    return composedDate.getDate() == d &&
            composedDate.getMonth() == m &&
            composedDate.getFullYear() == y;
  },
  /**
   * Vemos si es mayor de una edad solicitada.
   */
  validateAge: (day, month, year, age) => {
    const mydate = new Date();
    mydate.setFullYear(year, month - 1, day);

    const currdate = new Date();
    const setDate = new Date();
    setDate.setFullYear(mydate.getFullYear() + age, month - 1, day);
    if ((currdate - setDate) > 0) {
      return true;
    }
    return false;
  },
};

export default validation;
