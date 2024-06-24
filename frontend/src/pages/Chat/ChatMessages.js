import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";
import SendIcon from "@material-ui/icons/Send";
import PhotoIcon from "@material-ui/icons/Photo";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useDate } from "../../hooks/useDate";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    flex: 1,
    overflow: "hidden",
    borderRadius: 0,
    height: "100%",
    borderLeft: "1px solid rgba(0, 0, 0, 0.12)",
  },
  messageList: {
    position: "relative",
    overflowY: "auto",
    height: "100%",
    ...theme.scrollbarStyles,
    backgroundColor: theme.palette.chatlist,
  },
  inputArea: {
    position: "relative",
    height: "auto",
  },
  input: {
    padding: "20px",
  },
  buttonSend: {
    margin: theme.spacing(1),
  },
  boxLeft: {
    padding: "10px 10px 5px",
    margin: "10px",
    position: "relative",
    backgroundColor: "#7ded12",
    maxWidth: 450,
    borderRadius: 10,
    borderBottomLeftRadius: 0,
    border: "1px solid rgba(0, 0, 0, 0.12)",
  },
  boxRight: {
    padding: "10px 10px 5px",
    margin: "10px 10px 10px auto",
    position: "relative",
    backgroundColor: "#02ddfd63",
    textAlign: "right",
    maxWidth: 450,
    borderRadius: 10,
    borderBottomRightRadius: 0,
    border: "1px solid rgba(0, 0, 0, 0.12)",
  },
  imageMessage: {
    maxWidth: "100%",
    maxHeight: "200px", // Para limitar a altura das imagens
    borderRadius: 10,
  },
}));

export default function ChatMessages({
  chat,
  messages,
  handleSendMessage,
  handleLoadMore,
  scrollToBottomRef,
  pageInfo,
  loading,
}) {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const { datetimeToClient } = useDate();
  const baseRef = useRef();

  const [contentMessage, setContentMessage] = useState("");
  const [image, setImage] = useState(null);

  const scrollToBottom = () => {
    if (baseRef.current) {
      baseRef.current.scrollIntoView({});
    }
  };

  const unreadMessages = (chat) => {
    if (chat !== undefined) {
      const currentUser = chat.users.find((u) => u.userId === user.id);
      return currentUser.unreads > 0;
    }
    return 0;
  };

  useEffect(() => {
    if (unreadMessages(chat) > 0) {
      try {
        api.post(`/chats/${chat.id}/read`, { userId: user.id });
      } catch (err) {}
    }
    scrollToBottomRef.current = scrollToBottom;
  }, [chat, user.id, scrollToBottomRef]);

  const handleScroll = (e) => {
    const { scrollTop } = e.currentTarget;
    if (!pageInfo.hasMore || loading) return;
    if (scrollTop < 600) {
      handleLoadMore();
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleSendImage = async () => {
    if (image) {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("chatId", chat.id);
      formData.append("userId", user.id);

      try {
        const response = await api.post("/messages/image", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        handleSendMessage("", response.data.imageUrl); // Certifique-se de que handleSendMessage aceita imageUrl como segundo argumento
        setImage(null);
      } catch (err) {
        console.error("Failed to send image", err);
      }
    }
  };

  const handleSendMessageWrapper = async (message) => {
    if (image) {
      await handleSendImage(); // Envia a imagem primeiro
    }
    if (message.trim() !== "") {
      handleSendMessage(message);
      setContentMessage("");
    }
  };

  return (
    <Paper className={classes.mainContainer}>
      <div onScroll={handleScroll} className={classes.messageList}>
        {Array.isArray(messages) &&
          messages.map((item, key) => (
            <Box
              key={key}
              className={item.senderId === user.id ? classes.boxRight : classes.boxLeft}
            >
              <Typography variant="subtitle2">{item.sender.name}</Typography>
              {item.message && <Typography variant="body1">{item.message}</Typography>}
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt="Sent image"
                  className={classes.imageMessage}
                />
              )}
              <Typography variant="caption" display="block">
                {datetimeToClient(item.createdAt)}
              </Typography>
            </Box>
          ))}
        <div ref={baseRef}></div>
      </div>
      <div className={classes.inputArea}>
        <FormControl variant="outlined" fullWidth>
          <Input
            multiline
            value={contentMessage}
            onKeyUp={(e) => {
              if (e.key === "Enter" && contentMessage.trim() !== "") {
                handleSendMessageWrapper(contentMessage);
              }
            }}
            onChange={(e) => setContentMessage(e.target.value)}
            className={classes.input}
            endAdornment={
              <InputAdornment position="end">
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="icon-button-file"
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="icon-button-file">
                  <IconButton component="span" className={classes.buttonSend}>
                    <PhotoIcon />
                  </IconButton>
                </label>
                <IconButton
                  onClick={() => handleSendMessageWrapper(contentMessage)}
                  className={classes.buttonSend}
                >
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
        {image && (
          <div>
            <Typography variant="body2">Imagem: {image.name}</Typography>
          </div>
        )}
      </div>
    </Paper>
  );
}
