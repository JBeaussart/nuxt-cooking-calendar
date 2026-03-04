export const useToast = () => {
  const message = ref("");
  const visible = ref(false);
  let timer: ReturnType<typeof setTimeout> | null = null;

  const show = (text: string, duration = 3500) => {
    message.value = text;
    visible.value = true;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      visible.value = false;
    }, duration);
  };

  return { message, visible, show };
};
