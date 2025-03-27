import styled from "@emotion/styled";

const StyledH1 = styled.h1({
  fontSize: "40px",
  borderRadius: "8px",
  boxShadow: "10px 5px 5px lightgreen;",
  background: "grey",
  padding: "10px",
});

export const AppHeader = () => {
  return <StyledH1>SuperCollider MIDI Controller</StyledH1>;
};
