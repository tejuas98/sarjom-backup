package org.jharkhand.sarjom;

import android.Manifest;
import android.content.pm.PackageManager;
import androidx.core.content.ContextCompat;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import org.json.JSONObject;
import org.vosk.Model;
import org.vosk.Recognizer;
import org.vosk.android.RecognitionListener;
import org.vosk.android.SpeechService;
import org.vosk.android.StorageService;

import java.io.IOException;
import java.util.ArrayList;

@CapacitorPlugin(
    name = "VoskSpeech",
    permissions = {
        @Permission(
            alias = "speechRecognition",
            strings = { Manifest.permission.RECORD_AUDIO }
        )
    }
)
public class VoskSpeechRecognitionPlugin extends Plugin {
    private static Model model = null;
    private static boolean isModelLoading = false;
    private SpeechService speechService = null;
    private boolean isListening = false;

    @Override
    public void load() {
        super.load();
        initModelInBackground();
    }

    private synchronized void initModelInBackground() {
        if (model != null || isModelLoading) {
            return;
        }
        isModelLoading = true;
        StorageService.unpack(
            getContext(),
            "model",
            "model",
            (loadedModel) -> {
                model = loadedModel;
                isModelLoading = false;
                JSObject ret = new JSObject();
                ret.put("status", "ready");
                notifyListeners("modelReady", ret);
            },
            (exception) -> {
                isModelLoading = false;
                JSObject ret = new JSObject();
                ret.put("status", "error");
                ret.put("error", exception.getMessage());
                notifyListeners("modelError", ret);
            }
        );
    }

    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("available", model != null);
        ret.put("loading", isModelLoading);
        call.resolve(ret);
    }

    @PluginMethod
    public void startListening(PluginCall call) {
        boolean hasPerm = ContextCompat.checkSelfPermission(
            getContext(),
            Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED;

        if (!hasPerm) {
            requestPermissionForAlias("speechRecognition", call, "recordAudioCallback");
            return;
        }

        if (model == null) {
            initModelInBackground();
            call.reject("Offline speech model is initializing. Please try again in a moment.");
            return;
        }

        if (speechService != null) {
            speechService.stop();
            speechService.shutdown();
            speechService = null;
        }

        try {
            Recognizer recognizer;
            String grammar = call.getString("grammar", null);
            if (grammar != null && !grammar.isEmpty()) {
                recognizer = new Recognizer(model, 16000.0f, grammar);
            } else {
                recognizer = new Recognizer(model, 16000.0f);
            }

            speechService = new SpeechService(recognizer, 16000.0f);
            speechService.startListening(new RecognitionListener() {
                @Override
                public void onPartialResult(String hypothesis) {
                    try {
                        JSONObject json = new JSONObject(hypothesis);
                        String partial = json.optString("partial", "").trim();
                        if (!partial.isEmpty()) {
                            JSObject ret = new JSObject();
                            ArrayList<String> list = new ArrayList<>();
                            list.add(partial);
                            ret.put("matches", new JSArray(list));
                            ret.put("isFinal", false);
                            notifyListeners("partialResults", ret);
                        }
                    } catch (Exception e) {}
                }

                @Override
                public void onResult(String hypothesis) {
                    try {
                        JSONObject json = new JSONObject(hypothesis);
                        String text = json.optString("text", "").trim();
                        if (!text.isEmpty()) {
                            JSObject ret = new JSObject();
                            ArrayList<String> list = new ArrayList<>();
                            list.add(text);
                            ret.put("matches", new JSArray(list));
                            ret.put("isFinal", false);
                            notifyListeners("results", ret);
                            notifyListeners("partialResults", ret);
                        }
                    } catch (Exception e) {}
                }

                @Override
                public void onFinalResult(String hypothesis) {
                    try {
                        JSONObject json = new JSONObject(hypothesis);
                        String text = json.optString("text", "").trim();
                        JSObject ret = new JSObject();
                        ArrayList<String> list = new ArrayList<>();
                        if (!text.isEmpty()) {
                            list.add(text);
                        }
                        ret.put("matches", new JSArray(list));
                        ret.put("isFinal", true);
                        notifyListeners("results", ret);
                        notifyListeners("partialResults", ret);
                    } catch (Exception e) {}
                }

                @Override
                public void onError(Exception exception) {
                    JSObject ret = new JSObject();
                    ret.put("status", "error");
                    ret.put("error", exception.getMessage());
                    notifyListeners("listening", ret);
                }

                @Override
                public void onTimeout() {
                    JSObject ret = new JSObject();
                    ret.put("status", "timeout");
                    notifyListeners("listening", ret);
                }
            });

            isListening = true;
            call.resolve();
        } catch (IOException e) {
            call.reject("Failed to start speech service: " + e.getMessage());
        }
    }

    @PermissionCallback
    private void recordAudioCallback(PluginCall call) {
        boolean hasPerm = ContextCompat.checkSelfPermission(
            getContext(),
            Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED;

        if (hasPerm) {
            startListening(call);
        } else {
            call.reject("RECORD_AUDIO permission was denied by user");
        }
    }

    @PluginMethod
    public void stopListening(PluginCall call) {
        if (speechService != null) {
            speechService.stop();
            speechService.shutdown();
            speechService = null;
        }
        isListening = false;
        call.resolve();
    }

    @PluginMethod
    @Override
    public void checkPermissions(PluginCall call) {
        boolean hasPerm = ContextCompat.checkSelfPermission(
            getContext(),
            Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED;

        JSObject permissionsResult = new JSObject();
        permissionsResult.put("speechRecognition", hasPerm ? "granted" : "prompt");
        call.resolve(permissionsResult);
    }

    @PluginMethod
    @Override
    public void requestPermissions(PluginCall call) {
        boolean hasPerm = ContextCompat.checkSelfPermission(
            getContext(),
            Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED;

        if (hasPerm) {
            JSObject permissionsResult = new JSObject();
            permissionsResult.put("speechRecognition", "granted");
            call.resolve(permissionsResult);
            return;
        }

        requestPermissionForAlias("speechRecognition", call, "permissionsCallbackHelper");
    }

    @PermissionCallback
    private void permissionsCallbackHelper(PluginCall call) {
        boolean hasPerm = ContextCompat.checkSelfPermission(
            getContext(),
            Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED;

        JSObject permissionsResult = new JSObject();
        permissionsResult.put("speechRecognition", hasPerm ? "granted" : "denied");
        call.resolve(permissionsResult);
    }
}
