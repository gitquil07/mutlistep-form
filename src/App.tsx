import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { App as AntApp, ConfigProvider } from "antd";
import ruRU from "antd/locale/ru_RU";
import { selectFurthestReachableStep } from "./store/formSlice";
import { useAppSelector } from "./store/hooks";
import StepOne from "./pages/StepOne";
import StepTwo from "./pages/StepTwo/StepTwo";

const theme = {
  token: {
    colorPrimary: "#00c35f",
    colorLink: "#1b2b7a",
    colorText: "#2b2d33",
    colorTextPlaceholder: "#a3a8b5",
    colorFillTertiary: "#eef0f4",
    colorFillSecondary: "#e6e8ee",
    borderRadius: 8,
    fontFamily: 'Inter, system-ui, "Segoe UI", Roboto, sans-serif',
  },
  components: {
    Button: {
      primaryShadow: "none",
      fontWeight: 600,
    },
  },
};

// Returning users continue from the first step that still needs work
const ResumeRedirect = () => {
  const furthestReachable = useAppSelector(selectFurthestReachableStep);
  return <Navigate to={`/step-${furthestReachable}`} replace />;
};

function App() {
  return (
    <ConfigProvider locale={ruRU} theme={theme}>
      <AntApp>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ResumeRedirect />} />
            <Route path="/step-1" element={<StepOne />} />
            <Route path="/step-2" element={<StepTwo />} />
          </Routes>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
