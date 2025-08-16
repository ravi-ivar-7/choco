// Type declarations for Chrome extension dashboard

interface Window {
    dashboardController?: DashboardController;
}

interface DashboardController {
    selectPlatform(platform: any): void;
}
