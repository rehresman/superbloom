// Process incoming OSC messages
//this doesnt work right now, this is where we can add something to make visual
//updates when keys are pressed
export const processOscMessage = (data: any) => {
  // Handle specific OSC messages from SuperCollider
  //   if (data.address === "/note/feedback") {
  //     const note = data.args[0].value;
  //     const isOn = data.args[1].value > 0;
  //     // Update key visualization
  //     const key = document.querySelector(`.key[data-note="${note}"]`);
  //     if (key) {
  //       if (isOn) key.classList.add("active");
  //       else key.classList.remove("active");
  //     }
  //   }
};
