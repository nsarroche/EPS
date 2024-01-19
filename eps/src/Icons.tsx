import React from 'react';
import waterHeater from './icons/icon_water-heater_20.svg';
import heating from './icons/icon_heating_20.svg';
import plug from './icons/icon_plug_20.svg';

export function waterHeaterSvg() {
  return (<img src={waterHeater} className="water-heater-icon" alt="Chauffe eau" />);
}

export function heatingSvg() {
  return (<img src={heating} className="heating-icon" alt="Radiateur" />);
}

export function plugSvg() {
  return (<img src={plug} className="plug-icon" alt="Prise" />);
}
