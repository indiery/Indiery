import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../config/api';

const STEPS = ['Profile', 'Vehicle Docs', 'Bank Details', 'Review'];

export default function KYCScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', pan: '', selfie: null,
    vehicleType: 'bike', dl: null, rc: null, insurance: null,
    bankAccount: '', bankIfsc: '', bankName: '',
  });

  function set(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function pickImage(key) {
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7, base64: false });
    if (!result.canceled) set(key, result.assets[0]);
  }

  async function submit() {
    try {
      setLoading(true);
      await api.patch('/drivers/me', {
        name: form.name,
        pan: form.pan,
        vehicle_type: form.vehicleType,
        bank_account: form.bankAccount,
        bank_ifsc: form.bankIfsc,
        bank_name: form.bankName,
      });

      // Upload docs via FormData
      for (const [field, asset] of [['selfie', form.selfie], ['dl', form.dl], ['rc', form.rc], ['insurance', form.insurance]]) {
        if (!asset) continue;
        const fd = new FormData();
        fd.append('file', { uri: asset.uri, type: 'image/jpeg', name: `${field}.jpg` });
        await api.patch(`/drivers/me/docs/${field}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      Alert.alert('Submitted!', 'Your KYC is under review (24–48 hrs). You will be notified once approved.');
      navigation.replace('DriverHome');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      {/* Step indicator */}
      <View style={styles.stepRow}>
        {STEPS.map((s, i) => (
          <View key={s} style={styles.stepWrap}>
            <View style={[styles.stepNum, i <= step && styles.stepNumActive]}>
              <Text style={styles.stepNumText}>{i + 1}</Text>
            </View>
            <Text style={styles.stepLabel}>{s}</Text>
          </View>
        ))}
      </View>

      {/* Step 0 — Profile */}
      {step === 0 && (
        <View>
          <Text style={styles.sectionTitle}>Your Profile</Text>
          <Input label="Full Name" value={form.name} onChangeText={(v) => set('name', v)} />
          <Input label="PAN Number" value={form.pan} onChangeText={(v) => set('pan', v.toUpperCase())} />
          <DocPicker label="📷 Selfie" asset={form.selfie} onPick={() => pickImage('selfie')} />
        </View>
      )}

      {/* Step 1 — Vehicle Docs */}
      {step === 1 && (
        <View>
          <Text style={styles.sectionTitle}>Vehicle & Documents</Text>
          <Text style={styles.label}>Vehicle Type</Text>
          <View style={styles.vehicleRow}>
            {[['bike', '🏍️ Bike'], ['mini_truck_500', '🚐 Mini 500kg'], ['mini_truck_750', '🚛 Mini 750kg']].map(([k, l]) => (
              <TouchableOpacity key={k} style={[styles.vehicleBtn, form.vehicleType === k && styles.vehicleBtnActive]} onPress={() => set('vehicleType', k)}>
                <Text style={form.vehicleType === k ? styles.vehicleLabelActive : styles.vehicleLabel}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <DocPicker label="📄 Driving Licence" asset={form.dl} onPick={() => pickImage('dl')} />
          <DocPicker label="📄 Registration Certificate" asset={form.rc} onPick={() => pickImage('rc')} />
          <DocPicker label="📄 Insurance" asset={form.insurance} onPick={() => pickImage('insurance')} />
        </View>
      )}

      {/* Step 2 — Bank */}
      {step === 2 && (
        <View>
          <Text style={styles.sectionTitle}>Bank Details</Text>
          <Input label="Account Number" value={form.bankAccount} onChangeText={(v) => set('bankAccount', v)} keyboardType="numeric" />
          <Input label="IFSC Code" value={form.bankIfsc} onChangeText={(v) => set('bankIfsc', v.toUpperCase())} />
          <Input label="Account Holder Name" value={form.bankName} onChangeText={(v) => set('bankName', v)} />
        </View>
      )}

      {/* Step 3 — Review */}
      {step === 3 && (
        <View>
          <Text style={styles.sectionTitle}>Review & Submit</Text>
          <ReviewRow label="Name" value={form.name} />
          <ReviewRow label="PAN" value={form.pan} />
          <ReviewRow label="Vehicle" value={form.vehicleType} />
          <ReviewRow label="Bank Account" value={form.bankAccount} />
          <ReviewRow label="IFSC" value={form.bankIfsc} />
          <Text style={styles.note}>📋 Ops team will verify within 24–48 hours.</Text>
        </View>
      )}

      {/* Navigation buttons */}
      <View style={styles.btnRow}>
        {step > 0 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        )}
        {step < 3 ? (
          <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(step + 1)}>
            <Text style={styles.nextBtnText}>Next →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.submitBtn} onPress={submit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.nextBtnText}>Submit KYC ✅</Text>}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

function Input({ label, ...props }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} {...props} />
    </View>
  );
}

function DocPicker({ label, asset, onPick }) {
  return (
    <TouchableOpacity style={[styles.docBtn, asset && styles.docBtnDone]} onPress={onPick}>
      <Text style={styles.docBtnText}>{asset ? `✅ ${label}` : `📷 ${label}`}</Text>
    </TouchableOpacity>
  );
}

function ReviewRow({ label, value }) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue}>{value || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  stepRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  stepWrap: { alignItems: 'center' },
  stepNum: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#ddd', alignItems: 'center', justifyContent: 'center' },
  stepNumActive: { backgroundColor: '#e63946' },
  stepNumText: { color: '#fff', fontWeight: '700' },
  stepLabel: { fontSize: 10, color: '#888', marginTop: 3 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a2e', marginBottom: 16 },
  label: { fontSize: 13, color: '#555', marginBottom: 4, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 14 },
  vehicleRow: { gap: 8, marginBottom: 16 },
  vehicleBtn: { borderWidth: 1.5, borderColor: '#ddd', borderRadius: 10, padding: 12 },
  vehicleBtnActive: { borderColor: '#e63946', backgroundColor: '#fff5f5' },
  vehicleLabel: { fontSize: 13, color: '#555' },
  vehicleLabelActive: { fontSize: 13, color: '#e63946', fontWeight: '700' },
  docBtn: { borderWidth: 1.5, borderColor: '#457b9d', borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 10, borderStyle: 'dashed' },
  docBtnDone: { borderColor: '#2a9d8f', backgroundColor: '#f0faf8' },
  docBtnText: { color: '#457b9d', fontWeight: '600' },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, marginBottom: 40 },
  backBtn: { flex: 1, marginRight: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 14, alignItems: 'center' },
  backBtnText: { color: '#555', fontWeight: '600' },
  nextBtn: { flex: 2, backgroundColor: '#457b9d', borderRadius: 12, padding: 14, alignItems: 'center' },
  submitBtn: { flex: 2, backgroundColor: '#2a9d8f', borderRadius: 12, padding: 14, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  reviewLabel: { color: '#888', fontSize: 13 },
  reviewValue: { color: '#1a1a2e', fontWeight: '600', fontSize: 13 },
  note: { marginTop: 16, fontSize: 13, color: '#f4a261', lineHeight: 20 },
});
