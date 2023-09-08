import jsPsychHtmlMultiResponse from "@jspsych/plugin-html-button-response"

export const startGame = {
    type: jsPsychHtmlMultiResponse,
    stimulus: () => {
        return (
            `<div >
                <p style="font-size: 2rem; position:absolute; top: 35%; left: 50%; transform: translate(-50%, -50%); margin: 0; font-weight: semi-bold; color: rgba(76, 101, 139, 1);">Click here to start!</p>
            </div>`
        )
    },
    choices: ['Go'],
    button_html: () => {
        return (
            `<button style="position:absolute; top: 0; bottom: 0; left: 0; right: 0; margin: auto; width: 12vw; height: 12vh; background: none; border: 0px; width: 16vw">
                <img style="width: 15vw; cursor: pointer;" src='https://storage.googleapis.com/roar-pa/shared/go-blink.gif' alt='Go button'/>
            </button>`
        )
    }
}
