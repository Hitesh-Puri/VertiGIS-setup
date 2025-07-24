import { command } from "@vertigis/web/messaging";
import {
    ComponentModelBase,
    serializable,
    type ComponentModelProperties,
} from "@vertigis/web/models";

export type LayerListCustomMenuModelProperties = ComponentModelProperties;

@serializable
export default class LayerListCustomMenuModel extends ComponentModelBase<LayerListCustomMenuModelProperties> {
    
    /**
     * Custom command that will be executed when the menu item is clicked
     */
    @command("layer-list-custom-menu.execute")
    async executeCustomCommand(): Promise<void> {
        const message = "🎉 Custom Layer List Command executed successfully!";
        
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification('Custom Layer Command', {
                    body: 'Custom Layer List Command executed successfully!',
                    icon: '/favicon.ico',
                    tag: 'layer-command'
                });
            } else if (Notification.permission !== 'denied') {
                await Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification('Custom Layer Command', {
                            body: 'Custom Layer List Command executed successfully!',
                            icon: '/favicon.ico',
                            tag: 'layer-command'
                        });
                    }
                });
            }
        }
        
        this.showTemporaryToast(message);
    }
    
    /**
     * Creates a temporary toast-like notification that auto-dismisses
     */
    private showTemporaryToast(message: string): void {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 14px;
            cursor: pointer;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
        
        toast.addEventListener('click', () => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    document.body.removeChild(toast);
                }
            }, 300);
        });
    }
} 