import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useAuth } from '../../contexts';
import { Button, Header } from '../../components';
import { api } from '../../services/api';
import { ENDPOINTS } from '../../constants/api';
import { spacing, fontSize, fontWeight, borderRadius, colors as themeColors } from '../../constants/theme';

interface Contract {
  id: string;
  chatRoomId: string;
  userAId: string;
  userBId: string;
  status: 'DRAFT' | 'SIGNED';
  contractData: Record<string, any>;
  signatureA: boolean;
  signatureB: boolean;
  signedAt: string | null;
}

interface ContractScreenProps {
  route: {
    params: {
      contractId: string;
    };
  };
  navigation: any;
}

const CONTRACT_FIELDS: { key: string; label: string }[] = [
  { key: 'wakeUpTime', label: '기상 시간' },
  { key: 'lightsOutTime', label: '취침 시간' },
  { key: 'cleaningCycle', label: '청소 주기' },
  { key: 'choreRules', label: '청소 역할 분담' },
  { key: 'smokingPolicy', label: '흡연 정책' },
  { key: 'sleepHabits', label: '잠버릇' },
  { key: 'noisePolicy', label: '소음 정책' },
  { key: 'foodPolicy', label: '실내 취식 정책' },
  { key: 'temperaturePolicy', label: '온도 정책' },
  { key: 'homeVisitPolicy', label: '외박/귀가 정책' },
];

export function ContractScreen({ route, navigation }: ContractScreenProps) {
  const { contractId } = route.params;
  const { colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchContract();
  }, [contractId]);

  const fetchContract = async () => {
    try {
      const response = await api.get<Contract>(ENDPOINTS.CONTRACTS.GET(contractId));
      setContract(response);
      setEditData(response.contractData || {});
    } catch (error) {
      console.error('Failed to fetch contract:', error);
      Alert.alert('오류', '계약서를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!contract) return;
    setIsSaving(true);
    try {
      const response = await api.put<Contract>(
        ENDPOINTS.CONTRACTS.UPDATE(contract.id),
        { contractData: editData }
      );
      setContract(response);
      setIsEditing(false);
      Alert.alert('완료', '계약서가 수정되었습니다. 서명이 초기화되었습니다.');
    } catch (error: any) {
      Alert.alert('오류', error.message || '계약서 수정에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSign = async () => {
    if (!contract) return;

    Alert.alert(
      '서명 확인',
      '계약서에 서명하시겠습니까? 양측 모두 서명하면 계약이 체결됩니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '서명하기',
          onPress: async () => {
            setIsSigning(true);
            try {
              const response = await api.post<Contract>(
                ENDPOINTS.CONTRACTS.SIGN(contract.id)
              );
              setContract(response);
              if (response.status === 'SIGNED') {
                Alert.alert(
                  'Becoming Roomie!',
                  '축하합니다! 양측 모두 서명을 완료하여 룸메이트 계약이 체결되었습니다.',
                  [{ text: '확인', onPress: () => navigation.goBack() }]
                );
              } else {
                Alert.alert('완료', '서명이 완료되었습니다. 상대방의 서명을 기다려주세요.');
              }
            } catch (error: any) {
              Alert.alert('오류', error.message || '서명에 실패했습니다.');
            } finally {
              setIsSigning(false);
            }
          },
        },
      ]
    );
  };

  const isMySignatureDone = () => {
    if (!contract || !user) return false;
    if (user.id === contract.userAId) return contract.signatureA;
    if (user.id === contract.userBId) return contract.signatureB;
    return false;
  };

  const getSignatureStatus = () => {
    if (!contract) return { a: false, b: false };
    return { a: contract.signatureA, b: contract.signatureB };
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="룸메이트 계약서" showBack onBack={() => navigation.goBack()} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      </View>
    );
  }

  if (!contract) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="룸메이트 계약서" showBack onBack={() => navigation.goBack()} />
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.text.secondary }]}>
            계약서를 찾을 수 없습니다
          </Text>
        </View>
      </View>
    );
  }

  const isSigned = contract.status === 'SIGNED';
  const signatures = getSignatureStatus();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="룸메이트 계약서"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          !isSigned && !isEditing
            ? { label: '수정', onPress: () => setIsEditing(true) }
            : undefined
        }
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}>
        {/* 상태 배지 */}
        <View style={[
          styles.statusBadge,
          { backgroundColor: isSigned ? themeColors.matchHigh + '20' : themeColors.warning + '20' },
        ]}>
          <Text style={[
            styles.statusText,
            { color: isSigned ? themeColors.matchHigh : themeColors.warning },
          ]}>
            {isSigned ? '계약 체결 완료' : '초안 (서명 대기중)'}
          </Text>
        </View>

        {/* 서명 현황 */}
        <View style={[styles.signatureSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            서명 현황
          </Text>
          <View style={styles.signatureRow}>
            <View style={styles.signatureItem}>
              <Text style={[styles.signatureLabel, { color: colors.text.secondary }]}>
                사용자 A
              </Text>
              <Text style={[
                styles.signatureValue,
                { color: signatures.a ? themeColors.matchHigh : colors.text.tertiary },
              ]}>
                {signatures.a ? '서명 완료' : '미서명'}
              </Text>
            </View>
            <View style={styles.signatureItem}>
              <Text style={[styles.signatureLabel, { color: colors.text.secondary }]}>
                사용자 B
              </Text>
              <Text style={[
                styles.signatureValue,
                { color: signatures.b ? themeColors.matchHigh : colors.text.tertiary },
              ]}>
                {signatures.b ? '서명 완료' : '미서명'}
              </Text>
            </View>
          </View>
        </View>

        {/* 계약 내용 */}
        <Text style={[styles.sectionHeader, { color: colors.text.primary }]}>
          계약 내용
        </Text>

        {CONTRACT_FIELDS.map(field => (
          <View
            key={field.key}
            style={[styles.fieldRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>
              {field.label}
            </Text>
            {isEditing ? (
              <TextInput
                style={[styles.fieldInput, { color: colors.text.primary, borderColor: colors.border }]}
                value={String(editData[field.key] ?? '')}
                onChangeText={text => setEditData(prev => ({ ...prev, [field.key]: text }))}
                placeholder="입력해주세요"
                placeholderTextColor={colors.text.tertiary}
              />
            ) : (
              <Text style={[styles.fieldValue, { color: colors.text.primary }]}>
                {String(contract.contractData[field.key] ?? '미설정')}
              </Text>
            )}
          </View>
        ))}

        {/* 액션 버튼 */}
        {!isSigned && (
          <View style={styles.actions}>
            {isEditing ? (
              <View style={styles.editActions}>
                <Button
                  title="취소"
                  onPress={() => {
                    setIsEditing(false);
                    setEditData(contract.contractData || {});
                  }}
                  fullWidth
                />
                <View style={{ height: spacing.sm }} />
                <Button
                  title="저장"
                  onPress={handleSave}
                  loading={isSaving}
                  fullWidth
                />
              </View>
            ) : (
              <Button
                title={isMySignatureDone() ? '이미 서명했습니다' : '서명하기'}
                onPress={handleSign}
                disabled={isMySignatureDone()}
                loading={isSigning}
                fullWidth
              />
            )}
          </View>
        )}

        {isSigned && contract.signedAt && (
          <Text style={[styles.signedAt, { color: colors.text.tertiary }]}>
            체결일: {new Date(contract.signedAt).toLocaleDateString('ko-KR')}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.lg,
  },
  statusBadge: {
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
  },
  statusText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  signatureSection: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  signatureItem: {
    alignItems: 'center',
  },
  signatureLabel: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  signatureValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  sectionHeader: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
  },
  fieldRow: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  fieldValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  fieldInput: {
    fontSize: fontSize.md,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  actions: {
    marginTop: spacing.lg,
  },
  editActions: {},
  signedAt: {
    textAlign: 'center',
    fontSize: fontSize.sm,
    marginTop: spacing.lg,
  },
  errorText: {
    fontSize: fontSize.lg,
  },
});
