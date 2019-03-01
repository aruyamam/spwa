import spa from './spa';

$(document).ready(() => {
   spa.model.initModule();
   spa.shell.initModule($('#spa'));
});
