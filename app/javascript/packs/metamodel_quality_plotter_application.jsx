import React from 'react';
import ReactDOM from 'react-dom';
import MetaModelQualityPlotter from 'metamodel_quality_plotter';
// import WhatsOptApi from '../utils/WhatsOptApi';

document.addEventListener('DOMContentLoaded', () => {
  // const csrfToken = document.getElementsByName('csrf-token')[0].getAttribute('content');
  // const relativeUrlRoot = document.getElementsByName('relative-url-root')[0].getAttribute('content');

  // eslint-disable-next-line no-undef
  const plotterElt = $('#metamodel_quality_plotter');
  const quality = plotterElt.data('quality');
  const mdaName = plotterElt.data('mda-name');
  // const mda = plotterElt.data('mda');
  // const ope = plotterElt.data('ope');
  // const apiKey = plotterElt.data('api-key');

  // const api = new WhatsOptApi(csrfToken, apiKey, relativeUrlRoot);
  ReactDOM.render(<MetaModelQualityPlotter mdaName={mdaName} quality={quality} />, plotterElt[0]);
});
